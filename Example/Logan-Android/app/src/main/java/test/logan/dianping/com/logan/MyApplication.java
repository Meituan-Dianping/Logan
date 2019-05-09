package test.logan.dianping.com.logan;

import android.app.Application;
import android.util.Log;

import com.dianping.logan.Logan;
import com.dianping.logan.LoganConfig;
import com.dianping.logan.OnLoganProtocolStatus;

import java.io.File;

public class MyApplication extends Application {

    private static final String TAG = MyApplication.class.getName();
    private static final String FILE_NAME = "logan_v1";

    @Override
    public void onCreate() {
        super.onCreate();
        initLogan();
        Logan.w("MyApplication onCreate", 3);
        Logan.w("MyApplication onCreate", 3);
        Logan.w("MyApplication onCreate", 3);
    }

    private void initLogan() {
        LoganConfig config = new LoganConfig.Builder()
                .setCachePath(getApplicationContext().getFilesDir().getAbsolutePath())
                .setPath(getApplicationContext().getExternalFilesDir(null).getAbsolutePath()
                        + File.separator + FILE_NAME)
                .setEncryptKey16("0123456789012345".getBytes())
                .setEncryptIV16("0123456789012345".getBytes())
                .build();
        Logan.init(config);
        Logan.setDebug(true);
        Logan.setOnLoganProtocolStatus(new OnLoganProtocolStatus() {
            @Override
            public void loganProtocolStatus(String cmd, int code) {
                Log.d(TAG, "clogan > cmd : " + cmd + " | " + "code : " + code);
            }
        });

    }
}
