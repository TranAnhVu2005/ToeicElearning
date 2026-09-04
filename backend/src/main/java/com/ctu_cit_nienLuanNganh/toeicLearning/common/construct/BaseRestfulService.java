package com.ctu_cit_nienLuanNganh.toeicLearning.common.construct;

import org.springframework.data.domain.Page;


public abstract class BaseRestfulService<ResDTO, Params, CreateReq, UpdateReq> {

    //Nếu dữ liệu quá nhiều thì có thể nghĩ cách tối ưu hiệu năng ở đây chẳng hạn
    public abstract Page<ResDTO> getAll(Params params);

    public abstract ResDTO getById(String id);

    public abstract ResDTO create(CreateReq createReq);

    public abstract ResDTO update(String id, UpdateReq updateReq);

    public abstract void delete(String id);
}