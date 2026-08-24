package com.ctu_cit_nienLuanNganh.toeicLearning.helper.paginate;


import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Locale;

@Getter
@Setter
public class PaginateParams {
    private int numberPage = 1; //Mặc định là 1
    private int sizeOfPage = 10;
    private String sortBy = "createdAt";
    private String direction = "DESC";
    private String keyWord = "";
    public Pageable toPageable() {
        direction = direction.toLowerCase(Locale.ROOT);
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        if (sortDirection == null) {
            sortDirection = Sort.Direction.DESC;
        }
        return PageRequest.of(numberPage, sizeOfPage, Sort.by(sortDirection, sortBy));
    }
}
