package com.ctu_cit_nienLuanNganh.toeicLearning.common.construct;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


public abstract class BaseRestfulController<ResDTO, Params, CreateReq, UpdateReq> {

    @GetMapping
    @ResponseStatus(HttpStatus.OK) //Lấy tham số từ url như page, size, keyword
    public abstract ResponseEntity<?> getAll(@ModelAttribute Params params);

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public abstract ResponseEntity<?> getById(@PathVariable String id); // Dùng String

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) //Trả về 201 theo đúng Restful
    public abstract ResponseEntity<?> create(@Validated @RequestBody CreateReq createReq);

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public abstract ResponseEntity<?> update(@PathVariable String id, @Validated @RequestBody UpdateReq updateReq);

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Trả về mã 204 No Content theo đúng Restful
    public abstract ResponseEntity<?> delete(@PathVariable String id);
}