package com.madexel.sapanciftligi;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // local plugins must be registered before super.onCreate()
        registerPlugin(GameServicesPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
