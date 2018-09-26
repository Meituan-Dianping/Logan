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

#include <stdlib.h>
#include "console_util.h"
#include <string.h>
#include "mmap_util.h"
#include <errno.h>

//创建MMAP缓存buffer或者内存buffer
int open_mmap_file_clogan(char *_filepath, unsigned char **buffer, unsigned char **cache) {
    int back = LOGAN_MMAP_FAIL;
    if (NULL == _filepath || 0 == strnlen(_filepath, 128)) {
        back = LOGAN_MMAP_MEMORY;
    } else {
        unsigned char *p_map = NULL;
        int size = LOGAN_MMAP_LENGTH;
        int fd = open(_filepath, O_RDWR | O_CREAT, S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP); //后两个添加权限
        int isNeedCheck = 0; //是否需要检查mmap缓存文件重新检查
        if (fd != -1) { //保护
            int isFileOk = 0;
            FILE *file = fopen(_filepath, "rb+"); //先判断文件是否有值，再mmap内存映射
            if (NULL != file) {
                fseek(file, 0, SEEK_END);
                long longBytes = ftell(file);
                if (longBytes < LOGAN_MMAP_LENGTH) {
                    fseek(file, 0, SEEK_SET);
                    char zero_data[size];
                    memset(zero_data, 0, size);
                    size_t _size = 0;
                    _size = fwrite(zero_data, sizeof(char), size, file);
                    fflush(file);
                    if (_size == size) {
                        printf_clogan("copy data 2 mmap file success\n");
                        isFileOk = 1;
                        isNeedCheck = 1;
                    } else {
                        isFileOk = 0;
                    }
                } else {
                    isFileOk = 1;
                }
                fclose(file);
            } else {
                isFileOk = 0;
            }

            if (isNeedCheck) { //加强保护，对映射的文件要有一个适合长度的文件
                FILE *file = fopen(_filepath, "rb");
                if (file != NULL) {
                    fseek(file, 0, SEEK_END);
                    long longBytes = ftell(file);
                    if (longBytes >= LOGAN_MMAP_LENGTH) {
                        isFileOk = 1;
                    } else {
                        isFileOk = 0;
                    }
                    fclose(file);
                } else {
                    isFileOk = 0;
                }
            }

            if (isFileOk) {
                p_map = (unsigned char *) mmap(0, size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
            }
            if (p_map != MAP_FAILED && NULL != p_map && isFileOk) {
                back = LOGAN_MMAP_MMAP;
            } else {
                back = LOGAN_MMAP_MEMORY;
                printf_clogan("open mmap fail , reason : %s \n", strerror(errno));

            }
            close(fd);

            if (back == LOGAN_MMAP_MMAP &&
                access(_filepath, F_OK) != -1) { //在返回mmap前,做最后一道判断，如果有mmap文件才用mmap
                back = LOGAN_MMAP_MMAP;
                *buffer = p_map;
            } else {
                back = LOGAN_MMAP_MEMORY;
                if (NULL != p_map)
                    munmap(p_map, size);
            }
        } else {
            printf_clogan("open(%s) fail: %s\n", _filepath, strerror(errno));
        }
    }

    int size = LOGAN_MEMORY_LENGTH;
    unsigned char *tempData = malloc(size);
    if (NULL != tempData) {
        memset(tempData, 0, size);
        *cache = tempData;
        if (back != LOGAN_MMAP_MMAP) {
            *buffer = tempData;
            back = LOGAN_MMAP_MEMORY; //如果文件打开失败、如果mmap映射失败，走内存缓存
        }
    } else {
        if (back != LOGAN_MMAP_MMAP)
            back = LOGAN_MMAP_FAIL;
    }
    return back;
}
