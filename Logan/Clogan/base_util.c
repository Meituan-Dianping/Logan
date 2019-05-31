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

#include <sys/time.h>
#include <memory.h>
#include "console_util.h"

#define LOGAN_BYTEORDER_NONE  0
#define LOGAN_BYTEORDER_HIGH 1
#define LOGAN_BYTEORDER_LOW 2

//获取毫秒时间戳
long long get_system_current_clogan(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    long long time = ((long long) tv.tv_sec) * 1000 + ((long long) tv.tv_usec) / 1000;
    return time;
}

//是否为空字符串
int is_string_empty_clogan(char *item) {
    int flag = 1;
    if (NULL != item && strnlen(item, 10) > 0) {
        flag = 0;
    }
    return flag;
}
