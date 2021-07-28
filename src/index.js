/*
 * LightningChartJS example that showcases a extensively customized chart with Bubble-chart.
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Extract required parts from LightningChartJS.
const {
    lightningChart,
    SolidFill,
    SolidLine,
    ColorRGBA,
    emptyFill,
    FontSettings,
    AutoCursorModes,
    Animator,
    AnimationEasings,
    UIDraggingModes,
    UIOrigins,
    ColorPalettes,
    AxisTickStrategies,
    emptyLine,
    Themes
} = lcjs

// Custom callback template.
const forEachIn = (object, clbk) => { const obj = {}; for (const a in object) obj[a] = clbk(object[a]); return obj }

// Define colors to configure chart and bubbles.
const colors = {
    background: ColorRGBA(255, 255, 255),
    graphBackground: ColorRGBA(220, 255, 255),
    title: ColorRGBA(0, 100, 0),
    subTitle: ColorRGBA(0, 100, 0),
    bubbleBorder: ColorRGBA(0, 0, 0),
    bubbleFillPalette: ColorPalettes.fullSpectrum(100)
}

// Define font settings.
const fonts = {
    title: new FontSettings({
        size: 40,
        weight: 400
    })
}
// Create and subtitle with the same font settings, except font-size.
fonts.subTitle = fonts.title.setSize(20)

// Create solid fill styles for defined colors.
const solidFillStyles = forEachIn(colors, (color) => new SolidFill({ color }))

// Create chart with customized settings
const chart = lightningChart()
    .ChartXY({
        // theme: Themes.darkGold        
    })
    .setBackgroundFillStyle(solidFillStyles.background)
    .setSeriesBackgroundFillStyle(solidFillStyles.graphBackground)
    .setTitle('Custom Styled Chart')
    .setTitleFont(fonts.title)
    .setTitleFillStyle(solidFillStyles.title)
    .setTitleMarginTop(6)
    .setTitleMarginBottom(0)
    .setPadding({ left: 5, right: 5, top: 30, bottom: 30 })
    .setAutoCursorMode(AutoCursorModes.disabled)
    .setMouseInteractionRectangleZoom(undefined)
    .setMouseInteractionRectangleFit(undefined)
    .setMouseInteractions(false)

// Get axes.
const axes = {
    bottom: chart.getDefaultAxisX(),
    left: chart.getDefaultAxisY(),
    top: chart.addAxisX(true),
    right: chart.addAxisY(true).setChartInteractions(false)
}

chart.addUIElement(undefined, chart.uiScale)
    .setPosition({ x: 50, y: 93 })
    .setOrigin(UIOrigins.Center)
    .setText('- With Bubbles -')
    .setTextFont(fonts.subTitle)
    .setTextFillStyle(solidFillStyles.subTitle)
    .setDraggingMode(UIDraggingModes.notDraggable)
    .setBackground((bg) => bg
        .setFillStyle(emptyFill)
        .setStrokeStyle(emptyLine)
    )

// Axis mutator.
const overrideAxis = (axis) => axis
    .setTickStrategy(AxisTickStrategies.Empty)
    .setTitleMargin(0)
    .setMouseInteractions(undefined)

// Override default configurations of axes.
for (const axisPos in axes)
    overrideAxis(axes[axisPos]);

[axes.bottom, axes.left].forEach(axis => axis.setInterval(-100, 100).setScrollStrategy(undefined))
// Ratio between bubble ellipse width / height.
const bubbleWidthHeightRatio = {
    x: window.innerHeight / window.innerWidth,
    y: 1
}

// Create instance of ellipse series to draw bubbles.
const ellipseSeries = chart.addEllipseSeries()
let bubbleCount = 0

// Handler of dragging bubbles.
const bubbleDragHandler = (figure, event, button, startLocation, delta) => {
    const prevDimensions = figure.getDimensions()
    figure.setDimensions(Object.assign(prevDimensions, {
        x: prevDimensions.x + delta.x * figure.scale.x.getPixelSize(),
        y: prevDimensions.y + delta.y * figure.scale.y.getPixelSize()
    }))
}

// Create resizeBubble array and sizeArray to store the values separately 
const resizeBubble = []
const sizeArray = []

// Create a single bubble to visualize in specific coordinates and specified size.
const addBubble = (pos, size) => {
    const radius = size * 2.5
    const borderThickness = 1 + size * 1.0

    const color = colors.bubbleFillPalette(Math.round(Math.random() * 99))
    const fillStyle = new SolidFill({ color })
    const strokeStyle = new SolidLine({ fillStyle: solidFillStyles.bubbleBorder, thickness: borderThickness })

    const figure = ellipseSeries.add({
        x: pos.x,
        y: pos.y,
        radiusX: radius * bubbleWidthHeightRatio.x,
        radiusY: radius * bubbleWidthHeightRatio.y
    })
        .setFillStyle(fillStyle)
        .setStrokeStyle(strokeStyle)

    // Make draggable by mouse.
    figure.onMouseDrag(bubbleDragHandler)
    bubbleCount++
    return figure
}

// Create an event to handle the case when user resizes the window, the bubble will be automatically scaled 
chart.onResize(() => {
    for (let i = 0; i <= bubbleMaxCount - 1; i++) {
        const newBubble = resizeBubble[i].getDimensions()
        resizeBubble[i].setDimensions({
            x: newBubble.x,
            y: newBubble.y,
            radiusX: axes.bottom.scale.getPixelSize() * sizeArray[i] * 10,
            radiusY: axes.left.scale.getPixelSize() * sizeArray[i] * 10
        })
    }
})

// Create a single bubble to visualize in random coordinates and with random size.
const addRandomBubble = () => {
    const pos = {
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100
    }
    const size = 1 + Math.random() * 7.0
    sizeArray.push(size)
    resizeBubble.push(addBubble(pos, size))
}

// Amount of bubbles to render.
const bubbleMaxCount = 100

// Animate bubbles creation.
Animator(() => undefined)(2.5 * 1000, AnimationEasings.ease)([[0, bubbleMaxCount]], ([nextBubbleCount]) => {
    while (bubbleCount < nextBubbleCount)
        addRandomBubble()
})
