package com.scrapyard.management.DTO.Response.ScrapYardDTO;

import com.scrapyard.management.Models.Enums.MaterialType;
import java.math.BigDecimal;
import java.math.RoundingMode;

public record MaterialPricingKey(MaterialType materialType, BigDecimal unitPrice) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MaterialPricingKey that)) return false;
        if (materialType != that.materialType) return false;
        return unitPrice.setScale(4, RoundingMode.HALF_UP)
                .compareTo(that.unitPrice.setScale(4, RoundingMode.HALF_UP)) == 0;
    }

    @Override
    public int hashCode() {
        int result = materialType.hashCode();
        result = 31 * result + unitPrice.setScale(4, RoundingMode.HALF_UP).stripTrailingZeros().hashCode();
        return result;
    }
}
