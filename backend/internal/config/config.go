package config

import (
	"bufio"
	"os"
	"strings"
)

type Config struct {
	Port          string
	GroqAPIKey    string
	GroqModel     string
	AllowedOrigin string
}

func LoadConfig() Config {
	loadDotEnv(".env")
	loadDotEnv("../.env")
	loadDotEnv("../../.env")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	apiKey := os.Getenv("GROQ_API_KEY")

	model := os.Getenv("GROQ_MODEL")
	if model == "" {
		model = "llama-3.1-8b-instant"
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "*"
	}

	return Config{
		Port:          port,
		GroqAPIKey:    apiKey,
		GroqModel:     model,
		AllowedOrigin: allowedOrigin,
	}
}

func loadDotEnv(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			val = strings.Trim(val, `"'`)
			if os.Getenv(key) == "" {
				os.Setenv(key, val)
			}
		}
	}
}
