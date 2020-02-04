#
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html
#
Pod::Spec.new do |s|
  s.name             = 'flutter_logan'
  s.version          = '0.0.1'
  s.summary          = 'A new flutter plugin project.'
  s.description      = <<-DESC
A new flutter plugin project.
                       DESC
  s.homepage         = 'https://github.com/Meituan-Dianping/Logan/Futter'
  s.license          = { :file => '../LICENSE' }
  s.author           = { 'Your Company' => 'maxiaojun02@meituan.com' }
  s.source           = { :git => 'https://github.com/Meituan-Dianping/Logan.git', :tag => s.version.to_s }
  s.source_files = 'Classes/**/*'
  s.public_header_files = 'Classes/**/*.h'
  s.dependency 'Flutter'
  s.dependency 'Logan','1.2.6'

  s.ios.deployment_target = '8.0'
end

