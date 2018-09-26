cmake_minimum_required(VERSION 3.4.1)

SET (CMAKE_C_FLAGS_DEBUG          "-g")
SET (CMAKE_C_FLAGS_RELEASE        "-O2 -DNDEBUG")

set(EXTERN_DIR ../../../Logan/Clogan)

add_subdirectory(${EXTERN_DIR} clogan.out)

include_directories(${EXTERN_DIR})

link_directories(clogan.out)


find_library( # Sets the name of the path variable.
              log-lib

              # Specifies the name of the NDK library that
              # you want CMake to locate.
              log )

# Specifies libraries CMake should link to your target library. You
# can link multiple libraries, such as libraries you define in this
# build script, prebuilt third-party libraries, or system libraries.

add_library(logan SHARED src/main/jni/clogan_protocol.c)
target_link_libraries(logan ${log-lib} z clogan)
