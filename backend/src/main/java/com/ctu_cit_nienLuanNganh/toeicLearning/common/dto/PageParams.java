package com.ctu_cit_nienLuanNganh.toeicLearning.common.dto;


import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Locale;

@Getter
@Setter
public class PageParams {
    private int numberPage = 1; //Mặc định là 1
    private int sizeOfPage = 10;
    private String sortBy = "createdAt";
    private String direction = "DESC";
    private String keyWord = "";
    public Pageable toPageable() {
        direction = direction.toLowerCase(Locale.ROOT);
        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        int size = (sizeOfPage <= 0 || sizeOfPage > 100) ? 10 : sizeOfPage;
        return PageRequest.of(Math.max(0, numberPage -1), size, Sort.by(sortDirection, sortBy));
    }
}
