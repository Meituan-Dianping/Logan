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

#ifndef ANDROID_NOVA_LOGAN_CLOGAN_PROTOCOL_H_H
#define ANDROID_NOVA_LOGAN_CLOGAN_PROTOCOL_H_H
#ifdef __cplusplus
extern "C"
{
#endif

#include <jni.h>
#include <clogan_core.h>

/**
 * JNI write interface
 */
JNIEXPORT jint JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1write(JNIEnv *env, jobject instance,
                                                          jint flag, jstring log_,
                                                          jlong local_time, jstring thread_name_,
                                                          jlong thread_id, jint ismain);
/**
 * JNI init interface
 */
JNIEXPORT jint JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1init(JNIEnv *env, jobject instance,
                                                         jstring cache_path_,
                                                         jstring dir_path_, jint max_file,
                                                         jstring encrypt_key16_,
                                                         jstring encrypt_iv16_);

/**
 * JNI open interface
 */
JNIEXPORT jint JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1open(JNIEnv *env, jobject instance,
                                                         jstring file_name_);

/**
 * JNI flush interface
 */
JNIEXPORT void JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1flush(JNIEnv *env, jobject instance);

/**
 * JNI debug interface
 */
JNIEXPORT void JNICALL
Java_com_dianping_logan_CLoganProtocol_clogan_1debug(JNIEnv *env, jobject instance,
                                                          jboolean is_debug);


#ifdef __cplusplus
}
#endif

#endif //ANDROID_NOVA_LOGAN_CLOGAN_PROTOCOL_H_H
