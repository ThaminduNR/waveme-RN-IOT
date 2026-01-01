package com.mycamera

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import com.google.mediapipe.tasks.vision.gesturerecognizer.GestureRecognizerResult
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import kotlin.math.max
import kotlin.math.min

class OverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var results: GestureRecognizerResult? = null
    private var linePaint = Paint()
    private var pointPaint = Paint()
    private var textPaint = Paint()

    private var scaleFactor: Float = 1f
    private var imageWidth: Int = 1
    private var imageHeight: Int = 1

    init {
        initPaints()
    }

    private fun initPaints() {
        linePaint.apply {
            color = Color.parseColor("#00FF00")
            strokeWidth = LANDMARK_STROKE_WIDTH
            style = Paint.Style.STROKE
        }

        pointPaint.apply {
            color = Color.parseColor("#FFFF00")
            strokeWidth = LANDMARK_STROKE_WIDTH
            style = Paint.Style.FILL
        }

        textPaint.apply {
            color = Color.WHITE
            textSize = GESTURE_TEXT_SIZE
            style = Paint.Style.FILL
            setShadowLayer(5f, 0f, 0f, Color.BLACK)
        }
    }

    fun clear() {
        results = null
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        results?.let { gestureRecognizerResult ->
            // Draw hand landmarks
            for (landmark in gestureRecognizerResult.landmarks()) {
                for (normalizedLandmark in landmark) {
                    canvas.drawPoint(
                        normalizedLandmark.x() * imageWidth * scaleFactor,
                        normalizedLandmark.y() * imageHeight * scaleFactor,
                        pointPaint
                    )
                }

                HandLandmarker.HAND_CONNECTIONS.forEach { connection ->
                    val start = landmark[connection.start()]
                    val end = landmark[connection.end()]
                    canvas.drawLine(
                        start.x() * imageWidth * scaleFactor,
                        start.y() * imageHeight * scaleFactor,
                        end.x() * imageWidth * scaleFactor,
                        end.y() * imageHeight * scaleFactor,
                        linePaint
                    )
                }
            }

            // Draw gesture text
            gestureRecognizerResult.gestures().forEachIndexed { index, gestures ->
                if (gestures.isNotEmpty()) {
                    val gesture = gestures[0]
                    val gestureName = gesture.categoryName()
                    val confidence = String.format("%.2f", gesture.score())
                    
                    val landmarks = gestureRecognizerResult.landmarks()
                    if (index < landmarks.size && landmarks[index].isNotEmpty()) {
                        val firstLandmark = landmarks[index][0]
                        val x = firstLandmark.x() * imageWidth * scaleFactor
                        val y = firstLandmark.y() * imageHeight * scaleFactor - 50

                        canvas.drawText(
                            "$gestureName ($confidence)",
                            x,
                            max(0f, y),
                            textPaint
                        )
                    }
                }
            }
        }
    }

    fun setResults(
        gestureRecognizerResult: GestureRecognizerResult,
        imageHeight: Int,
        imageWidth: Int
    ) {
        results = gestureRecognizerResult

        this.imageHeight = imageHeight
        this.imageWidth = imageWidth

        scaleFactor = min(width * 1f / imageWidth, height * 1f / imageHeight)

        invalidate()
    }

    companion object {
        private const val LANDMARK_STROKE_WIDTH = 8F
        private const val GESTURE_TEXT_SIZE = 60F
    }
}

