# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /Users/baitian0521/Library/Android/sdk/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

-keep public class com.dianping.logan.CLoganProtocol{ *; }
-keep public class com.dianping.logan.Logan{ *; }
-keep public class com.dianping.logan.LoganConfig{ *; }
-keep public class com.dianping.logan.LoganConfig$Builder{ *; }
-keep public class com.dianping.logan.SendLogRunnable{ *; }
-keep public interface com.dianping.logan.LoganProtocolHandler{ *; }
-keep public interface com.dianping.logan.OnLoganProtocolStatus{ *; }
