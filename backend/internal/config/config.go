package config

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"reflect"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Debug           bool   `yaml:"debug"`
	Host            string `yaml:"host"`
	Port            string `yaml:"port"`
	BaseURL         string `yaml:"base_url"`
	DatabaseURL     string `yaml:"database_url"`
	MigrationSource string `yaml:"migration_source"`
}

type LogBuffer struct {
	buffer []logEntry
}

type logEntry struct {
	message string
	err     error
	meta    map[string]string
}

func NewConfigLogger() *LogBuffer {
	return &LogBuffer{}
}

func (cl *LogBuffer) Warn(message string, err error, meta map[string]string) {
	cl.buffer = append(cl.buffer, logEntry{message: message, err: err, meta: meta})
}

func (cl *LogBuffer) FlashToZap(logger *zap.Logger) {
	for _, entry := range cl.buffer {
		var fields []zap.Field
		if entry.err != nil {
			fields = append(fields, zap.Error(entry.err))
		}
		for k, v := range entry.meta {
			fields = append(fields, zap.String(k, v))
		}
		logger.Warn(entry.message, fields...)
	}
	cl.buffer = nil
}

func (c *Config) Validate(logger *zap.Logger) error {
	if c.DatabaseURL == "" {
		err := fmt.Errorf("DatabaseURL must be set")
		logger.Error("Configuration validation failed", zap.Error(err))
		return err
	}
	if c.MigrationSource == "" {
		err := fmt.Errorf("MigrationSource must be set")
		logger.Error("Configuration validation failed", zap.Error(err))
		return err
	}

	return nil
}

func Load() (*Config, *LogBuffer) {
	logger := NewConfigLogger()

	config := &Config{
		Debug:   false,
		Host:    "localhost",
		Port:    "8080",
		BaseURL: "http://localhost:8080",
	}

	config, err := FromFile("config.yaml", config, logger)
	if err != nil {
		logger.Warn("Failed to load configuration from file, using defaults", err, nil)
	}

	config, err = FromEnv(config)
	if err != nil {
		logger.Warn("Failed to load configuration from environment variables", err, nil)
	}

	config, err = FromFlags(config)
	if err != nil {
		logger.Warn("Failed to load configuration from command-line flags", err, nil)
	}

	return config, logger
}

func FromFile(path string, baseConfig *Config, logger *LogBuffer) (*Config, error) {
	file, err := os.Open(path)
	if err != nil {
		return baseConfig, err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			logger.Warn("Failed to close configuration file", err, map[string]string{"path": path})
		}
	}(file)

	fileConfig := &Config{}
	if err := yaml.NewDecoder(file).Decode(&fileConfig); err != nil {
		return baseConfig, err
	}
	return MergeConfigs(baseConfig, fileConfig)
}

func FromEnv(baseConfig *Config) (*Config, error) {

	if err := godotenv.Load(".env"); err != nil {
		return baseConfig, err
	}

	envConfig := &Config{
		Debug:           os.Getenv("DEBUG") == "true",
		Host:            os.Getenv("HOST"),
		Port:            os.Getenv("PORT"),
		BaseURL:         os.Getenv("BASE_URL"),
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		MigrationSource: os.Getenv("MIGRATION_SOURCE"),
	}

	return MergeConfigs(baseConfig, envConfig)
}

func FromFlags(baseConfig *Config) (*Config, error) {
	flagConfig := &Config{}

	flag.BoolVar(&flagConfig.Debug, "debug", baseConfig.Debug, "debug mode")
	flag.StringVar(&flagConfig.Host, "host", baseConfig.Host, "host")
	flag.StringVar(&flagConfig.Port, "port", baseConfig.Port, "port")
	flag.StringVar(&flagConfig.BaseURL, "base_url", baseConfig.BaseURL, "base url")
	flag.StringVar(&flagConfig.DatabaseURL, "database_url", flagConfig.DatabaseURL, "database url")
	flag.StringVar(&flagConfig.MigrationSource, "migration_source", baseConfig.MigrationSource, "migration source")

	flag.Parse()

	return MergeConfigs(baseConfig, flagConfig)
}

func MergeConfigs(baseConfig, overrideConfig *Config) (*Config, error) {
	if baseConfig == nil {
		return nil, errors.New("base config cannot be nil")
	}
	if overrideConfig == nil {
		return baseConfig, nil
	}

	final := baseConfig
	baseVal := reflect.ValueOf(final).Elem()
	overrideVal := reflect.ValueOf(overrideConfig).Elem()

	if baseVal.Type() != overrideVal.Type() {
		return nil, errors.New("config types do not match")
	}

	for i := 0; i < baseVal.NumField(); i++ {
		field := baseVal.Field(i)
		overrideField := overrideVal.Field(i)
		zero := reflect.Zero(field.Type()).Interface()

		if field.CanSet() && !reflect.DeepEqual(overrideField.Interface(), zero) {
			if (overrideField.Kind() == reflect.Slice || overrideField.Kind() == reflect.Array) && overrideField.Len() == 0 {
				continue
			}
			field.Set(overrideField)
		}
	}

	return final, nil
}
