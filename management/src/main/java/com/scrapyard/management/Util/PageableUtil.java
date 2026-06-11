package com.scrapyard.management.Util;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.Set;

public final class PageableUtil {

    private PageableUtil() {}

    public static Pageable buildPageable(int page, int size, String sortBy, String direction, Set<String> allowedFields) {
        if (!allowedFields.contains(sortBy)) {
            throw new IllegalArgumentException("Invalid sort field: " + sortBy);
        }
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return PageRequest.of(page, size, sort);
    }
}
