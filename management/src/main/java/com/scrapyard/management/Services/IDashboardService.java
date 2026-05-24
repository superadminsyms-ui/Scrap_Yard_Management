package com.scrapyard.management.Services;

import com.scrapyard.management.DTO.Response.DashboardDTO.DashboardResponse;

public interface IDashboardService {
    DashboardResponse getStats();
}
