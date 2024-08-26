require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoAdapterAEP'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = { :ios => '13.4', :tvos => '13.4' }
  s.swift_version  = '5.4'
  s.source         = { git: 'https://github.com/mayank-shekhar/aepsdk-expo-plugin' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency "React"
  s.dependency "AEPCore", ">= 5.0.0", "< 6.0.0"
  s.dependency "AEPLifecycle", ">= 5.0.0", "< 6.0.0"
  s.dependency "AEPIdentity", ">= 5.0.0", "< 6.0.0"
  s.dependency "AEPSignal", ">= 5.0.0", "< 6.0.0"
  s.dependency "AEPServices", ">= 5.0.0", "< 6.0.0"
  s.dependency "AEPEdge", ">= 5.0.0", "< 6.0.0"
  s.dependency "AEPMessaging", ">= 5.0.0", "< 6.0.0"
  s.dependency "AEPEdgeIdentity", ">= 5.0.0", "< 6.0.0"



  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  if !$ExpoUseSources&.include?(package['name']) && ENV['EXPO_USE_SOURCE'].to_i == 0 && File.exist?("#{s.name}.xcframework") && Gem::Version.new(Pod::VERSION) >= Gem::Version.new('1.10.0')
    s.source_files = "#{s.name}/**/*.h"
    s.vendored_frameworks = "#{s.name}.xcframework"
  else
    s.source_files = "#{s.name}/**/*.{h,m,swift}"
  end
end
