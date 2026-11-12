package com.ctu_cit_nienLuanNganh.toeicLearning.common.dto;


import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Locale;
import java.util.Set;

@Getter
@Setter
public class PageParams {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt", "userName", "userEmail",
            "isLocked", "totalScore", "currentStreak", "highestStreak",
            "titleTest", "status"
    );

    private int numberPage = 1; //Mặc định là 1
    private int sizeOfPage = 10;
    private String sortBy = "createdAt";
    private String direction = "DESC";
    private String keyWord = "";
    public Pageable toPageable() {
        String safeDirection = direction == null ? "desc" : direction.toLowerCase(Locale.ROOT);
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(safeDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String safeSortBy = (sortBy != null && ALLOWED_SORT_FIELDS.contains(sortBy.trim()))
                ? sortBy.trim() : "createdAt";
        int size = (sizeOfPage <= 0 || sizeOfPage > 100) ? 10 : sizeOfPage;
        int page = Math.min(10_000, Math.max(1, numberPage)) - 1;
        return PageRequest.of(page, size, Sort.by(sortDirection, safeSortBy));
    }
}
