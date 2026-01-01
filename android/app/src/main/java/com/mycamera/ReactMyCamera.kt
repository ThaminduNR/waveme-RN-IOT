package com.mycamera

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import android.widget.FrameLayout
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.mediapipe.tasks.vision.core.RunningMode
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class ReactMyCamera(context: Context) : FrameLayout(context), GestureRecognizerHelper.GestureRecognizerListener {

    private val reactContext: ReactContext = context as ReactContext
    private var previewView: PreviewView
    private var overlayView: OverlayView
    private var cameraExecutor: ExecutorService
    private var gestureRecognizerHelper: GestureRecognizerHelper? = null
    private var cameraProvider: ProcessCameraProvider? = null
    private var cameraFacing = CameraSelector.LENS_FACING_FRONT

    init {
        // Create PreviewView
        previewView = PreviewView(context).apply {
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
            implementationMode = PreviewView.ImplementationMode.COMPATIBLE
        }
        addView(previewView)

        // Create OverlayView
        overlayView = OverlayView(context).apply {
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        }
        addView(overlayView)

        cameraExecutor = Executors.newSingleThreadExecutor()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (hasCameraPermission()) {
            setupGestureRecognizer()
            startCamera()
        } else {
            Log.e(TAG, "Camera permission not granted")
            sendErrorEvent("Camera permission not granted")
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopCamera()
    }

    private fun hasCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun setupGestureRecognizer() {
        gestureRecognizerHelper = GestureRecognizerHelper(
            minHandDetectionConfidence = GestureRecognizerHelper.DEFAULT_HAND_DETECTION_CONFIDENCE,
            minHandTrackingConfidence = GestureRecognizerHelper.DEFAULT_HAND_TRACKING_CONFIDENCE,
            minHandPresenceConfidence = GestureRecognizerHelper.DEFAULT_HAND_PRESENCE_CONFIDENCE,
            currentDelegate = GestureRecognizerHelper.DELEGATE_CPU,
            runningMode = RunningMode.LIVE_STREAM,
            context = context,
            gestureRecognizerListener = this
        )
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)

        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .build()
                .also {
                    it.surfaceProvider = previewView.surfaceProvider
                }

            val imageAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor) { imageProxy ->
                        gestureRecognizerHelper?.recognizeLiveStream(imageProxy)
                    }
                }

            val cameraSelector = CameraSelector.Builder()
                .requireLensFacing(cameraFacing)
                .build()

            try {
                cameraProvider?.unbindAll()
                
                val lifecycleOwner = getLifecycleOwner()
                if (lifecycleOwner != null) {
                    cameraProvider?.bindToLifecycle(
                        lifecycleOwner,
                        cameraSelector,
                        preview,
                        imageAnalyzer
                    )
                } else {
                    Log.e(TAG, "Could not find LifecycleOwner")
                    sendErrorEvent("Could not find LifecycleOwner")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Use case binding failed", e)
                sendErrorEvent("Camera binding failed: ${e.message}")
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun stopCamera() {
        cameraProvider?.unbindAll()
        gestureRecognizerHelper?.clearGestureRecognizer()
        cameraExecutor.shutdown()
    }

    private fun getLifecycleOwner(): LifecycleOwner? {
        var context = context
        while (context != null) {
            if (context is LifecycleOwner) {
                return context
            }
            context = if (context is android.content.ContextWrapper) {
                context.baseContext
            } else {
                null
            }
        }
        return null
    }

    fun switchCamera() {
        cameraFacing = if (cameraFacing == CameraSelector.LENS_FACING_FRONT) {
            CameraSelector.LENS_FACING_BACK
        } else {
            CameraSelector.LENS_FACING_FRONT
        }
        startCamera()
    }

    override fun onError(error: String, errorCode: Int) {
        Log.e(TAG, "Gesture recognizer error: $error (code: $errorCode)")
        sendErrorEvent(error)
    }

    override fun onResults(resultBundle: GestureRecognizerHelper.ResultBundle) {
        post {
            if (resultBundle.results.isNotEmpty()) {
                val result = resultBundle.results[0]
                
                overlayView.setResults(
                    result,
                    resultBundle.inputImageHeight,
                    resultBundle.inputImageWidth
                )

                // Send gesture event to React Native
                if (result.gestures().isNotEmpty() && result.gestures()[0].isNotEmpty()) {
                    val gesture = result.gestures()[0][0]
                    sendGestureEvent(gesture.categoryName(), gesture.score())
                }
            } else {
                overlayView.clear()
            }
        }
    }

    private fun sendGestureEvent(gestureName: String, confidence: Float) {
        val event: WritableMap = Arguments.createMap()
        event.putString("gesture", gestureName)
        event.putDouble("confidence", confidence.toDouble())
        
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onGestureDetected", event)
    }

    private fun sendErrorEvent(error: String) {
        val event: WritableMap = Arguments.createMap()
        event.putString("error", error)
        
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onError", event)
    }

    companion object {
        private const val TAG = "ReactMyCamera"
    }
}
