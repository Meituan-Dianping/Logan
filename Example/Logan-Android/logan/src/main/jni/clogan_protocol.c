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

#include "clogan_protocol.h"

JNIEXPORT jint JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1write(JNIEnv *env, jobject instance, jint flag,
                                                     jstring log_, jlong local_time,
                                                     jstring thread_name_, jlong thread_id,
                                                     jint is_main) {
    const char *log = (*env)->GetStringUTFChars(env, log_, 0);
    const char *thread_name = (*env)->GetStringUTFChars(env, thread_name_, 0);

    jint code = (jint) clogan_write(flag, log, local_time, thread_name, thread_id, is_main);

    (*env)->ReleaseStringUTFChars(env, log_, log);
    (*env)->ReleaseStringUTFChars(env, thread_name_, thread_name);
    return code;

}

JNIEXPORT jint JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1init(JNIEnv *env, jobject instance,
                                                    jstring cache_path_,
                                                    jstring dir_path_, jint max_file,
                                                    jstring encrypt_key16_, jstring encrypt_iv16_) {
    const char *dir_path = (*env)->GetStringUTFChars(env, dir_path_, 0);
    const char *cache_path = (*env)->GetStringUTFChars(env, cache_path_, 0);
    const char *encrypt_key16 = (*env)->GetStringUTFChars(env, encrypt_key16_, 0);
    const char *encrypt_iv16 = (*env)->GetStringUTFChars(env, encrypt_iv16_, 0);

    jint code = (jint) clogan_init(cache_path, dir_path, max_file, encrypt_key16, encrypt_iv16);

    (*env)->ReleaseStringUTFChars(env, dir_path_, dir_path);
    (*env)->ReleaseStringUTFChars(env, cache_path_, cache_path);
    (*env)->ReleaseStringUTFChars(env, encrypt_key16_, encrypt_key16);
    (*env)->ReleaseStringUTFChars(env, encrypt_iv16_, encrypt_iv16);
    return code;
}

JNIEXPORT jint JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1open(JNIEnv *env, jobject instance,
                                                    jstring file_name_) {
    const char *file_name = (*env)->GetStringUTFChars(env, file_name_, 0);

    jint code = (jint) clogan_open(file_name);

    (*env)->ReleaseStringUTFChars(env, file_name_, file_name);
    return code;
}

JNIEXPORT void JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1flush(JNIEnv *env, jobject instance) {
    clogan_flush();
}

JNIEXPORT void JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1debug(JNIEnv *env, jobject instance,
                                                     jboolean is_debug) {
    int i = 1;
    if (!is_debug) {
        i = 0;
    }
    clogan_debug(i);
}
