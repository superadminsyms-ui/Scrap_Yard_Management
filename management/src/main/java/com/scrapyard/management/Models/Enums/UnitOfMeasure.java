package com.scrapyard.management.Models.Enums;

import java.math.BigDecimal;

public enum UnitOfMeasure {

    KILOGRAMS(2.20462),
    POUNDS(1.0),
    TONNES(2204.62);

    private final double toLbs;

    UnitOfMeasure(double toLbs) {
        this.toLbs = toLbs;
    }

    public BigDecimal toPounds(BigDecimal value) {
        return value.multiply(BigDecimal.valueOf(toLbs));
    }

}
