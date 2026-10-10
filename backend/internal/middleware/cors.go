package middleware

import (
	"net/http"
	"strings"
)

func NewCORSMiddleware(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := allowedOrigin
			if allowedOrigin == "" || allowedOrigin == "*" {
				origin = "*"
			} else {
				reqOrigin := r.Header.Get("Origin")
				if reqOrigin != "" {
					origins := strings.Split(allowedOrigin, ",")
					for _, o := range origins {
						trimmed := strings.TrimSpace(o)
						if trimmed == "*" || trimmed == reqOrigin {
							origin = reqOrigin
							break
						}
					}
				}
			}

			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Expose-Headers", "Content-Type")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
