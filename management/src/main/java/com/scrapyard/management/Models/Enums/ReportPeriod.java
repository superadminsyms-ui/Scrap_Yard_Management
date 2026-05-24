package com.scrapyard.management.Models.Enums;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

public enum ReportPeriod {

    WEEKLY,
    MONTHLY,
    QUARTERLY,
    SEMIANNUAL;

    public LocalDateTime getStartDate() {
        LocalDateTime now = LocalDateTime.now();
        return switch (this) {
            case WEEKLY -> now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
            case MONTHLY -> now.withDayOfMonth(1)
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
            case QUARTERLY -> {
                int quarterMonth = ((now.getMonthValue() - 1) / 3) * 3 + 1;
                yield now.withMonth(quarterMonth).withDayOfMonth(1)
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
            }
            case SEMIANNUAL -> {
                int halfMonth = now.getMonthValue() <= 6 ? 1 : 7;
                yield now.withMonth(halfMonth).withDayOfMonth(1)
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
            }
        };
    }

    public LocalDateTime getEndDate() {
        LocalDateTime now = LocalDateTime.now();
        return switch (this) {
            case WEEKLY -> now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                    .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
            case MONTHLY -> now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
                    .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
            case QUARTERLY -> {
                int quarterMonth = ((now.getMonthValue() - 1) / 3) * 3 + 3;
                LocalDateTime end = now.withMonth(quarterMonth).withDayOfMonth(1)
                        .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
                yield end.withDayOfMonth(end.toLocalDate().lengthOfMonth());
            }
            case SEMIANNUAL -> {
                int halfMonth = now.getMonthValue() <= 6 ? 6 : 12;
                LocalDateTime end = now.withMonth(halfMonth).withDayOfMonth(1)
                        .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
                yield end.withDayOfMonth(end.toLocalDate().lengthOfMonth());
            }
        };
    }
}
