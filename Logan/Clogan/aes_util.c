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

#include "aes_util.h"
#include "mbedtls/aes.h"

static unsigned char KEY[16] = {0};
static unsigned char IV[16] = {0};

void aes_encrypt_clogan(unsigned char *in, unsigned char *out, int length, unsigned char *iv) {
    mbedtls_aes_context context;
    mbedtls_aes_setkey_enc(&context, (unsigned char *) KEY, 128);
    mbedtls_aes_crypt_cbc(&context, MBEDTLS_AES_ENCRYPT, length, iv, in, out); //加密
}

void aes_init_key_iv(const char *key, const char *iv) {
    memcpy(KEY, key, 16);
    memcpy(IV, iv, 16);
}

void aes_inflate_iv_clogan(unsigned char *aes_iv) {
    memcpy(aes_iv, IV, 16);
}
