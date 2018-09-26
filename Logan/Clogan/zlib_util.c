/*
 * Copyright (c) 2018-present, 美团点评
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


#include "zlib_util.h"
#include "aes_util.h"

int init_zlib_clogan(cLogan_model *model) {
    int ret = 1;
    if (model->zlib_type == LOGAN_ZLIB_INIT) { //如果是init的状态则不需要init
        return Z_OK;
    }
    z_stream *temp_zlib = NULL;
    if (!model->is_malloc_zlib) {
        temp_zlib = malloc(sizeof(z_stream));
    } else {
        temp_zlib = model->strm;
    }

    if (NULL != temp_zlib) {
        model->is_malloc_zlib = 1; //表示已经 malloc 一个zlib
        memset(temp_zlib, 0, sizeof(z_stream));
        model->strm = temp_zlib;
        temp_zlib->zalloc = Z_NULL;
        temp_zlib->zfree = Z_NULL;
        temp_zlib->opaque = Z_NULL;
        ret = deflateInit2(temp_zlib, Z_BEST_COMPRESSION, Z_DEFLATED, (15 + 16), 8,
                           Z_DEFAULT_STRATEGY);
        if (ret == Z_OK) {
            model->is_ready_gzip = 1;
            model->zlib_type = LOGAN_ZLIB_INIT;
        } else {
            model->is_ready_gzip = 0;
            model->zlib_type = LOGAN_ZLIB_FAIL;
        }
    } else {
        model->is_malloc_zlib = 0;
        model->is_ready_gzip = 0;
        model->zlib_type = LOGAN_ZLIB_FAIL;

    }
    return ret;
}

void clogan_zlib(cLogan_model *model, char *data, int data_len, int type) {
    int is_gzip = model->is_ready_gzip;
    int ret;
    if (is_gzip) {
        unsigned int have;
        unsigned char out[LOGAN_CHUNK];
        z_stream *strm = model->strm;

        strm->avail_in = (uInt) data_len;
        strm->next_in = (unsigned char *) data;
        do {
            strm->avail_out = LOGAN_CHUNK;
            strm->next_out = (unsigned char *) out;
            ret = deflate(strm, type);
            if (Z_STREAM_ERROR == ret) {
                deflateEnd(model->strm);

                model->is_ready_gzip = 0;
                model->zlib_type = LOGAN_ZLIB_END;
            } else {
                have = LOGAN_CHUNK - strm->avail_out;
                int total_len = model->remain_data_len + have;
                unsigned char *temp = NULL;
                int handler_len = (total_len / 16) * 16;
                int remain_len = total_len % 16;
                if (handler_len) {
                    int copy_data_len = handler_len - model->remain_data_len;
                    char gzip_data[handler_len];
                    temp = (unsigned char *) gzip_data;
                    if (model->remain_data_len) {
                        memcpy(temp, model->remain_data, model->remain_data_len);
                        temp += model->remain_data_len;
                    }
                    memcpy(temp, out, copy_data_len); //填充剩余数据和压缩数据
                    aes_encrypt_clogan((unsigned char *) gzip_data, model->last_point, handler_len,
                                       (unsigned char *) model->aes_iv); //把加密数据写入缓存
                    model->total_len += handler_len;
                    model->content_len += handler_len;
                    model->last_point += handler_len;
                }
                if (remain_len) {
                    if (handler_len) {
                        int copy_data_len = handler_len - model->remain_data_len;
                        temp = (unsigned char *) out;
                        temp += copy_data_len;
                        memcpy(model->remain_data, temp, remain_len); //填充剩余数据和压缩数据
                    } else {
                        temp = (unsigned char *) model->remain_data;
                        temp += model->remain_data_len;
                        memcpy(temp, out, have);
                    }
                }
                model->remain_data_len = remain_len;
            }
        } while (strm->avail_out == 0);
    } else {
        int total_len = model->remain_data_len + data_len;
        unsigned char *temp = NULL;
        int handler_len = (total_len / 16) * 16;
        int remain_len = total_len % 16;
        if (handler_len) {
            int copy_data_len = handler_len - model->remain_data_len;
            char gzip_data[handler_len];
            temp = (unsigned char *) gzip_data;
            if (model->remain_data_len) {
                memcpy(temp, model->remain_data, model->remain_data_len);
                temp += model->remain_data_len;
            }
            memcpy(temp, data, copy_data_len); //填充剩余数据和压缩数据

            aes_encrypt_clogan((unsigned char *) gzip_data, model->last_point, handler_len,
                               (unsigned char *) model->aes_iv);
            model->total_len += handler_len;
            model->content_len += handler_len;
            model->last_point += handler_len;
        }
        if (remain_len) {
            if (handler_len) {
                int copy_data_len = handler_len - model->remain_data_len;
                temp = (unsigned char *) data;
                temp += copy_data_len;
                memcpy(model->remain_data, temp, remain_len); //填充剩余数据和压缩数据
            } else {
                temp = (unsigned char *) model->remain_data;
                temp += model->remain_data_len;
                memcpy(temp, data, data_len);
            }
        }
        model->remain_data_len = remain_len;
    }
}

void clogan_zlib_end_compress(cLogan_model *model) {
    clogan_zlib(model, NULL, 0, Z_FINISH);
    (void) deflateEnd(model->strm);
    int val = 16 - model->remain_data_len;
    char data[16];
    memset(data, val, 16);
    if (model->remain_data_len) {
        memcpy(data, model->remain_data, model->remain_data_len);
    }
    aes_encrypt_clogan((unsigned char *) data, model->last_point, 16,
                       (unsigned char *) model->aes_iv); //把加密数据写入缓存
    model->last_point += 16;
    *(model->last_point) = LOGAN_WRITE_PROTOCOL_TAIL;
    model->last_point++;
    model->remain_data_len = 0;
    model->total_len += 17;
    model->content_len += 16; //为了兼容之前协议content_len,只包含内容,不包含结尾符
    model->zlib_type = LOGAN_ZLIB_END;
    model->is_ready_gzip = 0;
}

void clogan_zlib_compress(cLogan_model *model, char *data, int data_len) {
    if (model->zlib_type == LOGAN_ZLIB_ING || model->zlib_type == LOGAN_ZLIB_INIT) {
        model->zlib_type = LOGAN_ZLIB_ING;
        clogan_zlib(model, data, data_len, Z_SYNC_FLUSH);
    } else {
        init_zlib_clogan(model);
    }
}

void clogan_zlib_delete_stream(cLogan_model *model) {
    (void) deflateEnd(model->strm);
    model->zlib_type = LOGAN_ZLIB_END;
    model->is_ready_gzip = 0;
}
