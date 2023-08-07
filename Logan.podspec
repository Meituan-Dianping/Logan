Pod::Spec.new do |s|
    s.name             = 'Logan'
    s.version          = '1.2.9'
    s.summary          = 'Logan is a lightweight case logging system based on mobile platform.'

    s.homepage         = 'https://github.com/Meituan-Dianping/Logan'
    s.license          = { :type => 'MIT', :file => 'LICENSE' }
    s.author           = { 'jiangteng' => 'jiangteng.cn@gmail.com', 'yxiangnan' => 'yxiangnan@gmail.com', 'maxiaojun' => 'xiaojun_ma@qq.com'}
    s.source           = { :git => 'https://github.com/Meituan-Dianping/Logan.git', :tag => s.version.to_s }

    s.ios.deployment_target = '8.0'
    s.osx.deployment_target = '10.9'

    s.source_files = "Logan/iOS/*", "Logan/Clogan/*.{h,c}"
    s.public_header_files = "Logan/iOS/*.h"

    s.subspec 'mbedtls' do |mbedtls|
        mbedtls.source_files = "Logan/mbedtls/**/*.{h,c}"
        mbedtls.header_dir = 'mbedtls'
        mbedtls.private_header_files = "Logan/mbedtls/**/*.h"
        mbedtls.pod_target_xcconfig = { "HEADER_SEARCH_PATHS" => "${PODS_ROOT}/Logan/Logan/**"}
    end
end
