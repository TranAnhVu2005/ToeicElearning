package com.ctu_cit_nienLuanNganh.toeicLearning.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> {
    @JsonView(ApiViews.Public.class)
    private List<T> content;       // Danh sách dữ liệu thực tế của trang hiện tại
    @JsonView(ApiViews.Public.class)
    private int pageNumber;        // Trang hiện tại
    @JsonView(ApiViews.Public.class)
    private int pageSize;          // Số lượng phần tử trên 1 trang
    @JsonView(ApiViews.Public.class)
    private long totalElements;    // Tổng số bản ghi trong Database
    @JsonView(ApiViews.Public.class)
    private int totalPages;        // Tổng số trang
    @JsonView(ApiViews.Public.class)
    @JsonProperty("isFirst")
    private boolean isFirst;        //Kiểm tra xem phải là trang đầu không
    @JsonView(ApiViews.Public.class)
    @JsonProperty("isLast")
    private boolean isLast;          // Kiểm tra xem đã là trang cuối cùng chưa


    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber() + 1)
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }
}
