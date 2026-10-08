package com.Lolo.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.Lolo.app.plugins.CameraStreamPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CameraStreamPlugin.class);
        super.onCreate(savedInstanceState);

        // Désactiver le retour haptique et le menu contextuel natif sur appui long
        WebView webView = getBridge().getWebView();
        webView.setHapticFeedbackEnabled(false);

    }
}
