package com.scrapyard.management.SecurityConfig;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LOGIN_MAX_REQUESTS = 5;
    private static final long LOGIN_WINDOW_MS = 60_000;

    private static final int API_MAX_REQUESTS = 100;
    private static final long API_WINDOW_MS = 60_000;

    private final ConcurrentHashMap<String, LinkedList<Long>> loginAttempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LinkedList<Long>> apiAttempts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String clientIp = getClientIp(request);
        String path = request.getRequestURI();

        if (path.equals("/api/auth/login") && isRateLimited(clientIp, loginAttempts, LOGIN_MAX_REQUESTS, LOGIN_WINDOW_MS)) {
            sendRateLimitResponse(response);
            return;
        }

        if (path.startsWith("/api/") && isRateLimited(clientIp, apiAttempts, API_MAX_REQUESTS, API_WINDOW_MS)) {
            sendRateLimitResponse(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(String ip, ConcurrentHashMap<String, LinkedList<Long>> store, int maxRequests, long windowMs) {
        long now = System.currentTimeMillis();
        LinkedList<Long> timestamps = store.computeIfAbsent(ip, k -> new LinkedList<>());

        synchronized (timestamps) {
            Iterator<Long> it = timestamps.iterator();
            while (it.hasNext()) {
                if (now - it.next() > windowMs) {
                    it.remove();
                }
            }

            if (timestamps.size() >= maxRequests) {
                return true;
            }

            timestamps.add(now);
            return false;
        }
    }

    private void sendRateLimitResponse(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write("{\"Error\":\"Too many requests. Please wait a moment and try again.\"}");
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }
}
