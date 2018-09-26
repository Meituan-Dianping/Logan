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

#include <string.h>
#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>
#include "logan_config.h"
#include "console_util.h"

#define LOGAN_MAX_PATH 1024

//判断文件和目录是否存在
int is_file_exist_clogan(const char *path) {
    int isExist = 0;
    if (NULL != path && strnlen(path, 1) > 0) {
        if (access(path, F_OK) == 0) {
            isExist = 1;
        }
    }
    return isExist;
}

//根据路径创建目录
int makedir_clogan(const char *path) {
    size_t beginCmpPath = 0;
    size_t endCmpPath = 0;
    size_t pathLen = strlen(path);
    char currentPath[LOGAN_MAX_PATH] = {0};

    printf_clogan("makedir_clogan > path : %s\n", path);
    //相对路径
    if ('/' != path[0]) {
        //获取当前路径
        getcwd(currentPath, LOGAN_MAX_PATH);
        strcat(currentPath, "/");
        printf_clogan("makedir_clogan > currentPath : %s\n", currentPath);
        beginCmpPath = strlen(currentPath);
        strcat(currentPath, path);
        if (path[pathLen - 1] != '/') {
            strcat(currentPath, "/");
        }
        endCmpPath = strlen(currentPath);
    } else {
        //绝对路径
        strcpy(currentPath, path);
        if (path[pathLen - 1] != '/') {
            strcat(currentPath, "/");
        }
        beginCmpPath = 1;
        endCmpPath = strlen(currentPath);
    }

    //创建各级目录
    for (size_t i = beginCmpPath; i < endCmpPath; i++) {
        if ('/' == currentPath[i]) {
            currentPath[i] = '\0';
            if (access(currentPath, F_OK) != 0) {
                if (mkdir(currentPath, 0777) == -1) {
                    return -1;
                }
            }
            currentPath[i] = '/';
        }
    }
    return 0;
}
