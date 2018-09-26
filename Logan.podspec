Pod::Spec.new do |s|
    s.name             = 'Logan'
    s.version          = '0.0.19'
    s.summary          = 'Logan.'

    s.description      = <<-DESC
    logan c版本
    DESC

    s.homepage         = 'http://git.dianpingoa.com/v1/sh/projects/MOBILE/repos/nova-clogan/browse'
    s.license          = { :type => 'MIT', :file => 'LICENSE' }
    s.author           = { 'white.bai' => 'white.bai@dianping.com' }
    s.source           = { :git => 'ssh://git@git.dianpingoa.com/mobile/nova-clogan.git', :tag => s.version.to_s }
    s.libraries = "z","c++"
    s.ios.deployment_target = '8.0'

    s.source_files = "clogan/**/*.{h,c}"
    s.public_header_files = "clogan/**/*.h"
    s.subspec 'mbedtls' do |mbedtls|
        mbedtls.source_files = "mbedtls/**/*.{c,h}"
        mbedtls.header_dir = 'mbedtls'
    end
end
