package com.Lolo.app.plugins;

import android.Manifest;
import android.graphics.SurfaceTexture;
import android.hardware.Camera;
import android.util.Log;
import android.view.TextureView;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;

@CapacitorPlugin(
    name = "CameraStream",
    permissions = {
        @Permission(strings = { Manifest.permission.CAMERA }, alias = "camera")
    }
)
@SuppressWarnings("deprecation") // Using deprecated Camera API intentionally for PoC
public class CameraStreamPlugin extends Plugin implements TextureView.SurfaceTextureListener {

    private static final String TAG = "CameraStreamPlugin";

    private Camera camera;
    private TextureView cameraTextureView;
    private FrameLayout cameraWrapper;
    private boolean isCameraPreviewShowing = false;
    private ViewGroup parentView;
    private int currentCameraId = Camera.CameraInfo.CAMERA_FACING_BACK;

    @Override
    public void load() {
        super.load();
        parentView = (ViewGroup) getBridge().getWebView().getParent();
    }

    @PluginMethod
    public void startCamera(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestPermissionForAlias("camera", call, "cameraPermissionCallback");
            return;
        }
        String mode = call.getString("mode", "40percent");
        internalStartCamera(call, mode);
    }

    @PermissionCallback
    private void cameraPermissionCallback(PluginCall call) {
        String mode = call.getString("mode", "40percent");
        if (getPermissionState("camera") == PermissionState.GRANTED) {
            internalStartCamera(call, mode);
        } else {
            call.reject("Camera permission denied.");
        }
    }

    private void internalStartCamera(PluginCall call, String mode) {
        if (isCameraPreviewShowing) {
            getActivity().runOnUiThread(() -> {
                updateLayoutForMode(mode);
                call.resolve();
            });
            return;
        }

        getActivity().runOnUiThread(() -> {
            try {
                // Create the wrapper and TextureView if they don't exist yet
                if (cameraWrapper == null && parentView != null) {
                    cameraWrapper = new FrameLayout(getContext());
                    
                    cameraTextureView = new TextureView(getContext());
                    cameraTextureView.setSurfaceTextureListener(this);

                    // Calculate height based on mode
                    int screenHeight = getActivity().getResources().getDisplayMetrics().heightPixels;
                    int screenWidth = getActivity().getResources().getDisplayMetrics().widthPixels;
                    
                    int wrapperHeight;
                    boolean isFullscreen = "fullscreen".equals(mode);
                    if (isFullscreen) {
                        wrapperHeight = ViewGroup.LayoutParams.MATCH_PARENT;
                    } else {
                        wrapperHeight = (int) (screenHeight * 0.40) - getStatusBarHeight();
                    }
                    
                    // We want the video itself to be strictly 9:16
                    // 16 is height, 9 is width.
                    // For fullscreen, use the actual screen height for texture calculations
                    int effectiveHeight = isFullscreen ? screenHeight : wrapperHeight;
                    int textureWidth = (int) (effectiveHeight * 9.0f / 16.0f);
                    int textureHeight = effectiveHeight;

                    // If for some reason the width exceeds the screen width, constrain it
                    if (textureWidth > screenWidth) {
                        textureWidth = screenWidth;
                        textureHeight = (int) (screenWidth * 16.0f / 9.0f);
                    }

                    // The wrapper fills the height and full width (so it can center the video)
                    // Use MarginLayoutParams since parent may be CoordinatorLayout, not FrameLayout
                    ViewGroup.MarginLayoutParams wrapperParams = new ViewGroup.MarginLayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        wrapperHeight
                    );
                    // In non-fullscreen mode, offset below the status bar
                    if (!isFullscreen) {
                        wrapperParams.topMargin = getStatusBarHeight();
                    }

                    // The TextureView is exactly 9:16 and centered in the wrapper
                    FrameLayout.LayoutParams textureParams = new FrameLayout.LayoutParams(
                        textureWidth,
                        textureHeight
                    );
                    textureParams.gravity = android.view.Gravity.CENTER;

                    cameraWrapper.addView(cameraTextureView, textureParams);
                    // Insert at index 0 — behind the WebView
                    parentView.addView(cameraWrapper, 0, wrapperParams);

                    // Make the WebView transparent so the camera shows through
                    getBridge().getWebView().setBackgroundColor(android.graphics.Color.TRANSPARENT);
                }

                // Open the camera
                if (camera == null) {
                    camera = Camera.open(currentCameraId);
                    camera.setDisplayOrientation(90); // Portrait mode
                    setOptimalCameraParameters(camera);
                }

                // If surface is already valid, we can start immediately
                if (cameraTextureView != null && cameraTextureView.getSurfaceTexture() != null) {
                    camera.setPreviewTexture(cameraTextureView.getSurfaceTexture());
                    camera.startPreview();
                }
                // Otherwise, onSurfaceTextureAvailable() will handle starting the preview when ready.

                isCameraPreviewShowing = true;
                call.resolve();
            } catch (IOException e) {
                Log.e(TAG, "Failed to start camera preview: " + e.getMessage(), e);
                call.reject("Failed to start camera preview: " + e.getMessage());
            } catch (RuntimeException e) {
                Log.e(TAG, "Camera is in use or not available: " + e.getMessage(), e);
                call.reject("Camera is in use or not available: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stopCamera(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (camera != null) {
                camera.stopPreview();
                camera.release();
                camera = null;
            }
            if (cameraWrapper != null && parentView != null) {
                parentView.removeView(cameraWrapper);
                cameraWrapper = null;
                cameraTextureView = null;
            }
            isCameraPreviewShowing = false;

            // Restore WebView background
            getBridge().getWebView().setBackgroundColor(android.graphics.Color.WHITE);
            call.resolve();
        });
    }

    @PluginMethod
    public void flipCamera(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (!isCameraPreviewShowing) {
                call.reject("Camera is not running");
                return;
            }

            // Toggle camera
            currentCameraId = (currentCameraId == Camera.CameraInfo.CAMERA_FACING_BACK) 
                ? Camera.CameraInfo.CAMERA_FACING_FRONT 
                : Camera.CameraInfo.CAMERA_FACING_BACK;

            // Stop current camera
            if (camera != null) {
                camera.stopPreview();
                camera.release();
                camera = null;
            }

            // Restart with new camera id
            try {
                camera = Camera.open(currentCameraId);
                camera.setDisplayOrientation(90); // Portrait mode
                setOptimalCameraParameters(camera);

                if (cameraTextureView != null && cameraTextureView.getSurfaceTexture() != null) {
                    camera.setPreviewTexture(cameraTextureView.getSurfaceTexture());
                    camera.startPreview();
                }
                call.resolve();
            } catch (Exception e) {
                Log.e(TAG, "Failed to flip camera: " + e.getMessage(), e);
                call.reject("Failed to flip camera: " + e.getMessage());
            }
        });
    }

    // ── Layout Update ──
    private void updateLayoutForMode(String mode) {
        if (cameraWrapper == null || cameraTextureView == null) return;

        int screenHeight = getActivity().getResources().getDisplayMetrics().heightPixels;
        int screenWidth = getActivity().getResources().getDisplayMetrics().widthPixels;
        
        boolean isFullscreen = "fullscreen".equals(mode);
        int wrapperHeight;
        if (isFullscreen) {
            wrapperHeight = ViewGroup.LayoutParams.MATCH_PARENT;
        } else {
            wrapperHeight = (int) (screenHeight * 0.40) - getStatusBarHeight();
        }
        
        // Strictly 9:16
        int effectiveHeight = isFullscreen ? screenHeight : wrapperHeight;
        int textureWidth = (int) (effectiveHeight * 9.0f / 16.0f);
        int textureHeight = effectiveHeight;

        if (textureWidth > screenWidth) {
            textureWidth = screenWidth;
            textureHeight = (int) (screenWidth * 16.0f / 9.0f);
        }

        ViewGroup.MarginLayoutParams wrapperParams = (ViewGroup.MarginLayoutParams) cameraWrapper.getLayoutParams();
        if (wrapperParams != null) {
            wrapperParams.height = wrapperHeight;
            wrapperParams.topMargin = isFullscreen ? 0 : getStatusBarHeight();
            cameraWrapper.setLayoutParams(wrapperParams);
        }

        FrameLayout.LayoutParams textureParams = (FrameLayout.LayoutParams) cameraTextureView.getLayoutParams();
        if (textureParams != null) {
            textureParams.width = textureWidth;
            textureParams.height = textureHeight;
            cameraTextureView.setLayoutParams(textureParams);
        }
    }

    // ── Status Bar Height Helper ──
    private int getStatusBarHeight() {
        int result = 0;
        int resourceId = getActivity().getResources().getIdentifier(
            "status_bar_height", "dimen", "android"
        );
        if (resourceId > 0) {
            result = getActivity().getResources().getDimensionPixelSize(resourceId);
        }
        return result;
    }

    // ── Camera Quality & Focus Configuration ──
    private void setOptimalCameraParameters(Camera camera) {
        if (camera == null) return;
        try {
            Camera.Parameters parameters = camera.getParameters();
            java.util.List<Camera.Size> sizes = parameters.getSupportedPreviewSizes();
            if (sizes != null) {
                Camera.Size optimalSize = null;
                long maxResolution = 0;
                long targetResolution = 1920 * 1080; // Target ~1080p max for fluid preview

                for (Camera.Size size : sizes) {
                    long resolution = (long) size.width * size.height;
                    // Find the highest resolution that isn't excessively huge
                    if (resolution > maxResolution && resolution <= targetResolution * 1.5) {
                        maxResolution = resolution;
                        optimalSize = size;
                    }
                }

                if (optimalSize == null && !sizes.isEmpty()) {
                    optimalSize = sizes.get(0);
                }

                if (optimalSize != null) {
                    Log.i(TAG, "Selected Camera Preview Size: " + optimalSize.width + "x" + optimalSize.height);
                    parameters.setPreviewSize(optimalSize.width, optimalSize.height);
                }
            }

            // Enable continuous autofocus if supported
            java.util.List<String> focusModes = parameters.getSupportedFocusModes();
            if (focusModes != null && focusModes.contains(Camera.Parameters.FOCUS_MODE_CONTINUOUS_VIDEO)) {
                parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_VIDEO);
                Log.i(TAG, "Continuous video autofocus enabled");
            }

            camera.setParameters(parameters);
        } catch (Exception e) {
            Log.e(TAG, "Failed to set optimal camera parameters", e);
        }
    }

    // ── Aspect Ratio / Center Crop ──
    private void adjustAspectRatio(int viewWidth, int viewHeight) {
        if (camera == null || cameraTextureView == null) return;

        try {
            Camera.Size previewSize = camera.getParameters().getPreviewSize();
            if (previewSize == null) return;
            
            // Because camera is rotated 90 degrees (Portrait), visually swap width and height
            float videoWidth = previewSize.height;
            float videoHeight = previewSize.width;

            float viewRatio = (float) viewWidth / (float) viewHeight;
            float videoRatio = videoWidth / videoHeight;

            android.graphics.Matrix matrix = new android.graphics.Matrix();

            if (viewRatio > videoRatio) {
                // View is wider than video. Scale height to CenterCrop.
                float scaleY = (viewWidth / videoRatio) / viewHeight;
                matrix.setScale(1f, scaleY, viewWidth / 2f, viewHeight / 2f);
            } else {
                // View is taller than video. Scale width to CenterCrop.
                float scaleX = (viewHeight * videoRatio) / viewWidth;
                matrix.setScale(scaleX, 1f, viewWidth / 2f, viewHeight / 2f);
            }

            // Must run on UI thread, but SurfaceTexture callbacks are already on UI thread
            cameraTextureView.setTransform(matrix);
        } catch (Exception e) {
            Log.e(TAG, "Error adjusting aspect ratio", e);
        }
    }

    // ── TextureView.SurfaceTextureListener ──

    @Override
    public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surface, int width, int height) {
        Log.i(TAG, "onSurfaceTextureAvailable: surface is ready");
        if (camera != null) {
            try {
                camera.setPreviewTexture(surface);
                camera.startPreview();
                adjustAspectRatio(width, height);
                Log.i(TAG, "onSurfaceTextureAvailable: camera preview started");
            } catch (IOException e) {
                Log.e(TAG, "Error setting camera preview display", e);
            } catch (RuntimeException e) {
                Log.e(TAG, "Error starting camera preview", e);
            }
        }
    }

    @Override
    public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surface, int width, int height) {
        Log.i(TAG, "onSurfaceTextureSizeChanged: width=" + width + " height=" + height);
        if (camera != null) {
            try {
                camera.stopPreview();
                camera.setPreviewTexture(surface);
                camera.startPreview();
                adjustAspectRatio(width, height);
                Log.i(TAG, "onSurfaceTextureSizeChanged: camera preview restarted");
            } catch (Exception e) {
                Log.e(TAG, "Error restarting camera preview", e);
            }
        }
    }

    @Override
    public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surface) {
        if (camera != null) {
            camera.stopPreview();
            camera.release();
            camera = null;
            isCameraPreviewShowing = false;
        }
        return true;
    }

    @Override
    public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surface) {
        // Invoked every time there's a new camera frame
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (camera != null) {
            camera.stopPreview();
            camera.release();
            camera = null;
            isCameraPreviewShowing = false;
        }
    }
}
