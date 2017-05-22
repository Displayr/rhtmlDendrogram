#' Create hierarchical cluster network diagrams.
#'
#' @param hc a hierarchical (\code{hclust}) cluster object.
#' @param height height for the network graph's frame area in pixels
#' @param width numeric width for the network graph's frame area in pixels
#' @param fontSize numeric font size in pixels for the node text labels.
#' @param fontFamily character string specitying font family for the labels (default 'sans-serif').
#' @param linkColour character string specifying the colour you want the link
#' lines to be. Multiple formats supported (e.g. hexadecimal).
#' @param nodeColour character string specifying the colour you want the node
#' circles to be. Multiple formats supported (e.g. hexadecimal).
#' @param nodeStroke character string specifying the colour you want the node
#' perimeter to be. Multiple formats supported (e.g. hexadecimal).
#' @param textColour character vector or scalar specifying the colour you want
#' the text to be before they are clicked. Order should match the order of
#' \code{hclust$labels}. Multiple formats supported (e.g. hexadecimal).
#' @param textOpacity numeric vector or scalar of the proportion opaque you
#' would like the text to be before they are clicked. rder should match the
#' order of \code{hclust$labels}.
#' @param textRotate numeric degress to rotate text for node text. Default
#' is 0 for horizontal and 65 degrees for vertical.
#' @param opacity numeric value of the proportion opaque you would like the
#' graph elements to be.
#' @param margins numeric value or named list of plot margins
#' (top, right, bottom, left). Set the margin appropriately to accomodate
#' long text labels.
#' @param linkType character specifying the link type between points. Options
#' are 'elbow' and 'diagonal'.
#' @param treeOrientation character specifying the tree orientation, Options
#' are 'vertical' and 'horizontal'.
#' @param zoom logical enabling plot zoom and pan
#'
#' @param tooltips a matrix containing the original data of each point. See examples. Defaults to NULL.
#' @param tooltipsFontSize integer specifying tooltip font size. Defaults to 11.
#' @param tooltipsFontFamily character string specifying tooltip font family. Defaults to "sans-serif".
#'
#' @param title character string specifying the chart title. Defaults to NULL.
#' @param titleFontSize integer specifying the font size of the title. Defaults to 24.
#' @param titleFontFamily character string specifying the font family of the title. Defaults to "sans-serif".
#' @param titleFontColor character string specifying the color of the title. Defaults to "#111",
#' @param subtitle character string specifying the chart subtitle. Defaults to NULL.
#' @param subtitleFontSize integer specifying the font size of the subtitle. Defaults to 18.
#' @param subtitleFontFamily character string specifying the font family of the subtitle. Defaults to "sans-serif",
#' @param subtitleFontColor character string specifying the color of the subtitle. Defaults to "#111",
#' @param footer character string specifying the chart footer. Defaults to NULL.
#' @param footerFontSize integer specifying the font size of the footer. Defaults to 11,
#' @param footerFontFamily character string specifying the font family of the footer. Defaults to "sans-serif",
#' @param footerFontColor character string specifying the color of the footer. Defaults to "#111",
#'
#'
#' @examples
#' \dontrun{
#' hc <- hclust(dist(USArrests), "ave")
#'
#' dendroNetwork(hc, height = 600)
#' dendroNetwork(hc, treeOrientation = "vertical")
#'
#' dendroNetwork(hc, height = 600, linkType = "diagonal")
#' dendroNetwork(hc, treeOrientation = "vertical", linkType = "diagonal")
#'
#' dendroNetwork(hc, textColour = c("red", "green", "orange")[cutree(hc, 3)],
#'                height = 600)
#' dendroNetwork(hc, textColour = c("red", "green", "orange")[cutree(hc, 3)],
#'                treeOrientation = "vertical")
#' dendroNetwork(hc, textColour = c("red", "green", "orange")[cutree(hc, 3)], zoom = TRUE, tooltips = USArrests)
#' }
#'
#' @source Mike Bostock: \url{http://bl.ocks.org/mbostock/4063570}.
#'
#' Fabio Nelli: \url{http://www.meccanismocomplesso.org/en/dendrogramma-d3-parte1/}
#'
#' @importFrom stats setNames
#' @importFrom utils modifyList
#' @export
#'
dendroNetwork <- function(
    hc,
    height = NULL,
    width = NULL,
    fontSize = 11,
    fontFamily = "sans-serif",
    linkColour = "#ccc",
    nodeColour = "#fff",
    nodeStroke = "steelblue",
    textColour = "#111",
    textOpacity = 0.9,
    textRotate = NULL,
    opacity = 0.9,
    margins = NULL,
    linkType = c("elbow", "diagonal"),
    treeOrientation = c("horizontal", "vertical"),

    tooltips = NULL,
    tooltipsFontSize = 11,
    tooltipsFontFamily = "sans-serif",

    title = NULL,
    titleFontSize = 24,
    titleFontFamily = "sans-serif",
    titleFontColor = "#111",

    subtitle = NULL,
    subtitleFontSize = 18,
    subtitleFontFamily = "sans-serif",
    subtitleFontColor = "#111",

    footer = NULL,
    footerFontSize = 11,
    footerFontFamily = "sans-serif",
    footerFontColor = "#111",
    zoom = FALSE)
{
    # validate input
    if (length(textColour) == 1L)
        textColour = rep(textColour, length(hc$labels))
    if (length(textOpacity) == 1L)
        textOpacity = rep(textOpacity, length(hc$labels))

    linkType = match.arg(linkType[1], c("elbow", "diagonal"))
    treeOrientation = match.arg(treeOrientation[1],
                                c("horizontal", "vertical"))

    if (!is.null(tooltips)) {
      tooltips_colnames = colnames(tooltips)
      if (is.null(tooltips_colnames)) {
        tooltips_colnames = paste0(rep("feature", ncol(tooltips)), 1:length(tooltips))
      }
      tooltips = as.matrix(tooltips)
      dimnames(tooltips) = NULL
      colnames = tooltips_colnames
    } else {
      colnames = NULL
    }

    root <- as.dendroNetwork(hc, textColour, textOpacity, tooltips)

    if (treeOrientation == "vertical")
        margins_def = list(top = 10, right = 40, bottom = 150, left = 10)
    else
        margins_def = list(top = 10, right = 150, bottom = 10, left = 10)

    if (length(margins) == 1L && is.numeric(margins)) {
        margins = as.list(setNames(rep(margins, 4),
                                   c("top", "right", "bottom", "left")))
    } else if (is.null(margins)) {
        margins = margins_def
    } else {
        margins = modifyList(margins_def, margins)
    }

    if (is.null(textRotate))
        textRotate = ifelse(treeOrientation == "vertical", 65, 0)

    # create options
    options = list(
        height = height,
        width = width,
        fontSize = fontSize,
        fontFamily = fontFamily,
        linkColour = linkColour,
        nodeColour = nodeColour,
        nodeStroke = nodeStroke,
        textRotate = textRotate,
        margins = margins,
        opacity = opacity,
        linkType = linkType,
        treeOrientation = treeOrientation,
        colnames = colnames,
        tooltipsFontSize = tooltipsFontSize,
        tooltipsFontFamily = tooltipsFontFamily,
        title = title,
        titleFontSize = titleFontSize,
        titleFontFamily = titleFontFamily,
        titleFontColor = titleFontColor,
        subtitle = subtitle,
        subtitleFontSize = subtitleFontSize,
        subtitleFontFamily = subtitleFontFamily,
        subtitleFontColor = subtitleFontColor,
        footer = footer,
        footerFontSize = footerFontSize,
        footerFontFamily = footerFontFamily,
        footerFontColor = footerFontColor,
        zoom = zoom
    )

    # create widget
    htmlwidgets::createWidget(
        name = "rhtmlDendrogram",
        x = list(root = root, options = options),
        width = width,
        height = height,
        sizingPolicy = htmlwidgets::sizingPolicy(padding = 5, browser.fill = TRUE),
        package = "rhtmlDendrogram")
}

as.dendroNetwork <- function(hc, textColour, textOpacity, tips)
{
    if (!("hclust" %in% class(hc)))
        stop("hc must be a object of class hclust")

    if (length(textColour) != length(hc$labels))
        stop("textColour length must match label length")
    if (length(textOpacity) != length(hc$labels))
        stop("textOpacity length must match label length")
    if (!is.null(tips) && nrow(tips) != length(hc$labels))
        stop("tooltips must have same nrow as hc")

    ul <- function(lev)
    {
        child = lapply(1:2, function(i) {
            val <- abs(hc$merge[lev, ][i])
            if (hc$merge[lev, ][i] < 0) {
              if (!is.null(tips)) {
                list(name = hc$labels[val], y = 0, textColour = textColour[val],
                     textOpacity = textOpacity[val], tips = tips[val,])
              } else {
                list(name = hc$labels[val], y = 0, textColour = textColour[val],
                     textOpacity = textOpacity[val], tips = NULL)
              }
            }
            else {
              ul(val)
            }

        })
        list(name = "", y = hc$height[lev], children = child, tips = NULL)
    }
    ul(nrow(hc$merge))
}
