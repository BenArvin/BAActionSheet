import React from 'react';
import {
    Text,
    Image,
    View,
    TouchableOpacity,
    ScrollView,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import PropTypes from "prop-types";

const HEIGHT_SEPARATOR = 1
const HEIGHT_HEADRE = 53
const HEIGHT_ITEM = 53
const HEIGHT_TAIL = 53
const HEIGHT_CLOSE_BUTTON = 16

const MARGIN_CLOSE_BUTTON_LEFT = 18
const MARGIN_CLOSE_BUTTON_TOP = 19
const MARGIN_ITEM_SEPARATOR_LEFT = 15

const COLOR_SEPARATOR = '#E6E6E6'
const COLOR_HEADER_TITLE = '#353543'
const COLOR_ITEM_TITLE = '#3A3A48'
const COLOR_TAIL_TITLE = '#353543'

const FONT_SIZE_HEADER_TITLE = 16
const FONT_SIZE_ITEM_TITLE = 14
const FONT_SIZE_TAIL_TITLE = 14

const FONT_FAMILY_HEADER_TITLE = 'PingFangSC-Light'
const FONT_FAMILY_ITEM_TITLE = 'PingFangSC-Light'
const FONT_FAMILY_TAIL_TITLE = 'PingFangSC-Regular'

const DURATION_EASE_ANIMATION = 100
const DURATION_POP_ANIMATION = 250
const DURATION_START_DELAY = 100

export class BAActionSheet extends React.PureComponent {
    _animating = false
    _windowWidth = 0
    _windowHeight = 0

    _cachedSheetHeight = 0
    _cachedScrollViewHeight = 0

    //global style
    _enableSeparator = true

    //header style
    _headerFontColor = '#353543'
    _headerFontFamily = 'PingFangSC-Light'
    _headerEnableCloseButton = false

    //body style
    _bodyFontColor = '#3A3A48'
    _bodyFontFamily = 'PingFangSC-Light'
    _bodyTitleAlign = 'left'

    //tail style
    _tailFontColor = '#3A3A48'
    _tailFontFamily = 'PingFangSC-Light'
    _tailTitleAlign = 'left'

    //datas
    _headerData = null
    _bodyData = null
    _tailData = null

    static propTypes = {
        //callback function for item selected, params: index
        onItemSelected: PropTypes.func,
        //callback function for sheet tail selected, non param
        onTailSelected: PropTypes.func,
        //callback function for sheet cancelled by tap background view or close button in sheet header, non param
        onCancelled: PropTypes.func,
    }

    constructor(props) {
        super(props)

        this.show = this.show.bind(this)
        this.hide = this.hide.bind(this)
        this.setGlobalStyle = this.setGlobalStyle.bind(this)
        this.setHeaderStyle = this.setHeaderStyle.bind(this)
        this.setBodyStyle = this.setBodyStyle.bind(this)
        this.setTailStyle = this.setTailStyle.bind(this)
        this._rejudgeHeightOfSheet = this._rejudgeHeightOfSheet.bind(this)
        this._rejudgeHeightOfScrollView = this._rejudgeHeightOfScrollView.bind(this)
        this._sheetHeader = this._sheetHeader.bind(this)
        this._onHeaderCloseButtonSelected = this._onHeaderCloseButtonSelected.bind(this)
        this._onBlankAreaSelected = this._onBlankAreaSelected.bind(this)
        this._itemsOfSheet = this._itemsOfSheet.bind(this)
        this._onSheetItemSelected = this._onSheetItemSelected.bind(this)
        this._sheetTail = this._sheetTail.bind(this)
        this._onSheetTailSelected = this._onSheetTailSelected.bind(this)

        this.state = {
            displaying: false,
            currentSelectedIndex: -1,
            animatedTranslateY: new Animated.Value(this._cachedSheetHeight),
            translucentAlpha: new Animated.Value(0.0),
        }
    }

    componentDidMount() {
        //FIXME: window size is not accurate because of bottom system bar in android device, so, to avoid this problem, you should replace Dimensions function with native method in android
        this._windowWidth = Dimensions.get('window').width
        this._windowHeight = Dimensions.get('window').height
        this._maxHeight = this._windowHeight / 2
    }

    render() {
        return (
            <Modal
                visible={this.state.displaying}
                transparent={true}
                onRequestClose={() => {
                    // android
                }}>
                <Animated.View style={{
                    alignItems: 'center',
                    width: this._windowWidth,
                    height: this._windowHeight,
                    backgroundColor: 'rgba(0,0,0,0)',
                    opacity: this.state.translucentAlpha,
                }}>
                    <View style={{backgroundColor: 'rgba(0,0,0,0.65)'}}>
                        <TouchableOpacity style={{
                            width: this._windowWidth,
                            height: this._windowHeight - this._cachedSheetHeight,
                        }} onPress={this._onBlankAreaSelected}/>
                        <Animated.View style={{transform: [{translateY: this.state.animatedTranslateY}]}}>
                            {this._sheetHeader()}
                            <View style={{
                                backgroundColor: '#ffffff',
                                width: this._windowWidth,
                                height: this._cachedScrollViewHeight
                            }}>
                                <ScrollView
                                    contentContainerStyle={{width: this._windowWidth, backgroundColor: '#ffffff'}}
                                    showsVerticalScrollIndicator={false}
                                    alwaysBounceVertical={false}>
                                    {this._itemsOfSheet()}
                                </ScrollView>
                            </View>
                            {this._sheetTail()}
                        </Animated.View>
                    </View>
                </Animated.View>
            </Modal>
        )
    }

    //public methods
    /*
    * set global style of sheet
    *
    * maxHeight: PropTypes.number, max height of sheet, default half of screen
    * enableSeparator: PropTypes.bool, show separator lines between items, default true
    * */
    setGlobalStyle(maxHeight, enableSeparator) {
        if (maxHeight) {
            this._maxHeight = maxHeight
        }
        this._enableSeparator = enableSeparator
    }

    /*
    * set style of sheet header
    *
    * fontColor: PropTypes.string, font color of title, default #353543
    * fontFamily: PropTypes.string, font family of title, default PingFangSC-Light
    * enableCloseButton: PropTypes.bool, show close button in left side, default false
    * */
    setHeaderStyle(fontColor, fontFamily, enableCloseButton) {
        if (fontColor) {
            this._headerFontColor = fontColor
        }
        if (fontFamily) {
            this._headerFontFamily = fontFamily
        }
        this._headerEnableCloseButton = enableCloseButton
    }

    /*
    * set style of sheet body
    *
    * fontColor: PropTypes.string, font color of title, default #3A3A48
    * fontFamily: PropTypes.string, font family of title, default PingFangSC-Light
    * titleAlign: PropTypes.oneOf(['left', 'center', 'right']), text align of title, default left
    * */
    setBodyStyle(fontColor, fontFamily, titleAlign) {
        if (fontColor) {
            this._bodyFontColor = fontColor
        }
        if (fontFamily) {
            this._bodyFontFamily = fontFamily
        }
        if (titleAlign) {
            this._bodyTitleAlign = titleAlign
        }
    }

    /*
    * set style of sheet tail
    *
    * fontColor: PropTypes.string, font color of title, default #3A3A48
    * fontFamily: PropTypes.string, font family of title, default PingFangSC-Light
    * titleAlign: PropTypes.oneOf(['left', 'center', 'right']), text align of title, default left
    * */
    setTailStyle(fontColor, fontFamily, titleAlign) {
        if (fontColor) {
            this._tailFontColor = fontColor
        }
        if (fontFamily) {
            this._tailFontFamily = fontFamily
        }
        if (titleAlign) {
            this._tailTitleAlign = titleAlign
        }
    }

    /*
    * headerData: data for sheet header, sheet header will not display if null
    * {
    *   title: PropTypes.string
    *   closeIcon: PropTypes.object, image for close button in left side
    * }
    * bodyData: data for sheet body
    * {
    *   defaultSelectedIndex: PropTypes.number, default selected index before select by users, default 0
    *   items: [{
    *       image: PropTypes.object, left side image for body item
    *       title: PropTypes.string, title text for body item
    *       normalIcon: PropTypes.object, right side image when body item unselected
    *       selectedIcon: PropTypes.object, right side image when body item selected
    *   }]
    * }
    * tailData: data for sheet tail, sheet tail will not display if null
    * {
    *   image: PropTypes.object, left side image
    *   title: PropTypes.string, title text
    *   icon: PropTypes.object, right side image
    * }
    * onFinished: PropTypes.func, callback function for animation finished
    * */
    show(headerData, bodyData, tailData, onFinished) {
        if (this._animating) {
            return
        }
        this._animating = true

        //update data and rejudge height
        this._headerData = headerData
        this._bodyData = bodyData
        this._tailData = tailData
        this._rejudgeHeightOfSheet()
        this._rejudgeHeightOfScrollView()

        /*
        * setState and start animation
        *
        * 1. setState to trigger render action and make component displaying
        * 2. delay a short time to wait for render action finish
        * 3. start ease in animation of background view
        * 4. start pop out animation of sheet
        * 5. all finished
        * */
        let currentSelectedIndexTmp = (
            this._bodyData
            && this._bodyData.items
            && this._bodyData.defaultSelectedIndex >= 0
            && this._bodyData.defaultSelectedIndex < this._bodyData.items.length
        ) ? this._bodyData.defaultSelectedIndex : -1
        this.setState((prevState, props) => {
            return {
                displaying: true,
                currentSelectedIndex: currentSelectedIndexTmp,
                animatedTranslateY: new Animated.Value(this._cachedSheetHeight)
            }
        }, () => {
            let animateSequence = Animated.sequence([
                Animated.delay(DURATION_START_DELAY),
                Animated.timing(this.state.translucentAlpha, {
                    toValue: 1,
                    duration: DURATION_EASE_ANIMATION,
                })
            ])
            animateSequence.start(event => {
                Animated.timing(this.state.animatedTranslateY, {
                    toValue: 0,
                    duration: DURATION_POP_ANIMATION,
                }).start(event => {
                    this._animating = false
                    if (onFinished) {
                        onFinished()
                    }
                })
            })
        })
    }

    hide(onFinished) {
        if (this._animating) {
            return
        }
        this._animating = true

        /*
        * start animation and setState
        *
        * 1. delay a short time to wait for render action of selected item finish
        * 2. start pop out animation of sheet
        * 3. start ease out animation of background view
        * 4. setState to trigger render action and make component disappear
        * 5. all finished
        * */
        let animateSequence = Animated.sequence([
            Animated.delay(DURATION_START_DELAY),
            Animated.timing(this.state.animatedTranslateY, {
                toValue: this._cachedSheetHeight,
                duration: DURATION_POP_ANIMATION,
            })
        ])
        animateSequence.start(event => {
            Animated.timing(this.state.translucentAlpha, {
                toValue: 0,
                duration: DURATION_EASE_ANIMATION,
            }).start(event => {
                this.setState((prevState, props) => {
                    return {
                        displaying: false
                    }
                });
                this._animating = false
                if (onFinished) {
                    onFinished()
                }
            })
        })
    }

    //select action methods
    _onBlankAreaSelected() {
        this.hide(() => {
            if (this.props.onCancelled != undefined) {
                this.props.onCancelled()
            }
        })
    }

    _onHeaderCloseButtonSelected() {
        this.hide(() => {
            if (this.props.onCancelled != undefined) {
                this.props.onCancelled()
            }
        })
    }

    _onSheetItemSelected(index) {
        this.setState((prevState, props) => {
            return {
                currentSelectedIndex: index
            }
        });
        this.hide(() => {
            if (this.props.onItemSelected != undefined) {
                this.props.onItemSelected(index)
            }
        })
    }

    _onSheetTailSelected() {
        this.hide(() => {
            if (this.props.onTailSelected != undefined) {
                this.props.onTailSelected()
            }
        })
    }

    //private methods
    _rejudgeHeightOfSheet() {
        let result = 0
        if (this._headerData) {
            result = result + HEIGHT_HEADRE
        }
        if (this._bodyData && this._bodyData.items) {
            result = result + HEIGHT_ITEM * this._bodyData.items.length
        }
        if (this._tailData) {
            result = result + HEIGHT_TAIL
        }
        if (result > this._maxHeight) {
            result = this._maxHeight
        }
        this._cachedSheetHeight = result
    }

    _rejudgeHeightOfScrollView() {
        this._cachedScrollViewHeight = this._cachedSheetHeight
        if (this._headerData) {
            this._cachedScrollViewHeight = this._cachedScrollViewHeight - HEIGHT_HEADRE
        }
        if (this._tailData) {
            this._cachedScrollViewHeight = this._cachedScrollViewHeight - HEIGHT_TAIL
        }
    }

    _sheetHeader() {
        if (this._headerData) {
            return (<ActionSheetHeader
                closeIcon={this._headerData.closeIcon}
                title={this._headerData.title}
                fontColor={this._headerFontColor}
                fontFamily={this._headerFontFamily}
                enableSeparator={this._enableSeparator}
                enableCloseButton={this._headerEnableCloseButton}
                onSelected={this._onHeaderCloseButtonSelected}/>)
        } else {
            return null
        }
    }

    _itemsOfSheet() {
        if (!this._bodyData || !this._bodyData.items) {
            return null
        }
        let scrollViewContentDivs = []
        for (let i = 0; i < this._bodyData.items.length; i++) {
            let item = this._bodyData.items[i]
            let enableSeparator = (!this._enableSeparator || i == 0) ? false : true
            scrollViewContentDivs.push(
                <ActionSheetRenderItem
                    key={i}
                    index={i}
                    image={item.image}
                    title={item.title}
                    fontColor={this._bodyFontColor}
                    fontFamily={this._bodyFontFamily}
                    titleAlign={this._bodyTitleAlign}
                    selected={i == this.state.currentSelectedIndex ? true : false}
                    normalIcon={item.normalIcon}
                    selectedIcon={item.selectedIcon}
                    enableSeparator={enableSeparator}
                    onSelected={this._onSheetItemSelected}/>
            )
        }
        return scrollViewContentDivs
    }

    _sheetTail() {
        if (this._tailData) {
            return (<ActionSheetTail
                image={this._tailData.image}
                title={this._tailData.title}
                fontColor={this._tailFontColor}
                fontFamily={this._tailFontFamily}
                titleAlign={this._tailTitleAlign}
                icon={this._tailData.icon}
                onSelected={this._onSheetTailSelected}
                enableSeparator={this._enableSeparator}/>)
        } else {
            return null
        }
    }
}

class ActionSheetHeader extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        fontColor: PropTypes.string,
        fontFamily: PropTypes.string,
        enableCloseButton: PropTypes.bool,
        closeIcon: PropTypes.object,
        enableSeparator: PropTypes.bool,
        onSelected: PropTypes.func,
    }

    static defaultProps = {
        fontColor: COLOR_HEADER_TITLE,
        fontFamily: FONT_FAMILY_HEADER_TITLE,
        enableSeparator: false,
        enableCloseButton: false,
    }

    render() {
        let leftDiv = (<View style={{width: HEIGHT_HEADRE}}></View>)
        if (this.props.enableCloseButton) {
            let leftInnerDiv = null
            if (this.props.closeIcon) {
                leftInnerDiv = (
                    <Image style={{
                        marginTop: MARGIN_CLOSE_BUTTON_TOP,
                        marginLeft: MARGIN_CLOSE_BUTTON_LEFT,
                        width: HEIGHT_CLOSE_BUTTON,
                        height: HEIGHT_CLOSE_BUTTON,
                    }} source={this.props.closeIcon}/>
                )
            }
            leftDiv = (
                <TouchableOpacity
                    onPress={this.props.onSelected}
                    style={{
                        width: HEIGHT_HEADRE - HEIGHT_SEPARATOR * 2,
                        height: HEIGHT_HEADRE - HEIGHT_SEPARATOR * 2,
                    }}>
                    {leftInnerDiv}
                </TouchableOpacity>
            )
        }

        let bottomSeparatorColor = this.props.enableSeparator ? COLOR_SEPARATOR : 'rgba(0,0,0,0)'

        return (
            <View style={{backgroundColor: '#ffffff', height: HEIGHT_HEADRE}}>
                <View style={{height: HEIGHT_SEPARATOR}}></View>
                <View style={[this.props.style, {flexDirection: 'row', flexGrow: 1, alignItems: 'center'}]}>
                    {leftDiv}
                    <Text style={{
                        fontSize: FONT_SIZE_HEADER_TITLE,
                        fontFamily: this.props.fontFamily,
                        color: this.props.fontColor,
                        textAlign: 'center',
                        flexGrow: 1,
                    }}>{this.props.title}</Text>
                    <View style={{width: 70}}></View>
                </View>
                <View style={{height: HEIGHT_SEPARATOR, backgroundColor: bottomSeparatorColor}}></View>
            </View>
        )
    }
}

class ActionSheetRenderItem extends React.Component {
    static propTypes = {
        index: PropTypes.number,
        selected: PropTypes.bool,
        image: PropTypes.object,
        title: PropTypes.string,
        fontColor: PropTypes.string,
        fontFamily: PropTypes.string,
        titleAlign: PropTypes.oneOf(['left', 'center', 'right']),
        normalIcon: PropTypes.object,
        selectedIcon: PropTypes.object,
        enableSeparator: PropTypes.bool,
        onSelected: PropTypes.func,
    }

    static defaultProps = {
        selected: false,
        fontColor: COLOR_ITEM_TITLE,
        fontFamily: FONT_FAMILY_ITEM_TITLE,
        titleAlign: 'left',
        enableSeparator: false
    }

    constructor(props) {
        super(props)
        this._onSelected = this._onSelected.bind(this)
    }

    render() {
        let topSeparatorColor = this.props.enableSeparator ? COLOR_SEPARATOR : 'rgba(0,0,0,0)'

        let leftDiv = <View style={{width: 30, height: 30, marginLeft: 30, marginRight: 10}}></View>
        if (this.props.image != undefined) {
            leftDiv = <Image style={{width: 30, height: 30, marginLeft: 30, marginRight: 10}}
                             source={this.props.image}></Image>
        }

        let centerDiv = <View style={{flexGrow: 1}}></View>
        if (this.props.title != undefined && this.props.title != null) {
            centerDiv = <Text style={{
                fontSize: FONT_SIZE_ITEM_TITLE,
                fontFamily: this.props.fontFamily,
                color: this.props.fontColor,
                textAlign: this.props.titleAlign,
                flexGrow: 1,
            }}>{this.props.title}</Text>
        }

        let rightDiv = <View style={{width: 23, height: 23, marginLeft: 33, marginRight: 14}}></View>
        let rightIcon = this.props.selected ? this.props.selectedIcon : this.props.normalIcon
        if (rightIcon != undefined) {
            rightDiv =
                <Image style={{width: 23, height: 23, marginLeft: 33, marginRight: 14}} source={rightIcon}></Image>
        }
        return (
            <View style={[this.props.style, {height: HEIGHT_ITEM}]}>
                <View style={{
                    marginLeft: MARGIN_ITEM_SEPARATOR_LEFT,
                    height: HEIGHT_SEPARATOR,
                    backgroundColor: topSeparatorColor
                }}></View>
                <TouchableOpacity
                    style={{flexDirection: 'row', flexGrow: 1, alignItems: 'center'}}
                    onPress={this._onSelected}>
                    {leftDiv}
                    {centerDiv}
                    {rightDiv}
                </TouchableOpacity>
                <View style={{height: HEIGHT_SEPARATOR}}></View>
            </View>
        )
    }

    //select action methods
    _onSelected() {
        if (this.props.onSelected != undefined) {
            this.props.onSelected(this.props.index)
        }
    }
}

class ActionSheetTail extends React.Component {
    static propTypes = {
        image: PropTypes.object,
        title: PropTypes.string,
        fontColor: PropTypes.string,
        fontFamily: PropTypes.string,
        titleAlign: PropTypes.oneOf(['left', 'center', 'right']),
        icon: PropTypes.object,
        onSelected: PropTypes.func,
        enableSeparator: PropTypes.bool,
    }

    static defaultProps = {
        fontColor: COLOR_TAIL_TITLE,
        titleAlign: 'left',
        fontFamily: FONT_FAMILY_TAIL_TITLE,
        enableSeparator: false
    }

    constructor(props) {
        super(props)
        this._onSelected = this._onSelected.bind(this)
    }

    render() {
        let topSeparatorColor = this.props.enableSeparator ? COLOR_SEPARATOR : 'rgba(0,0,0,0)'
        let leftDiv = <View style={{width: 30, height: 30, marginLeft: 30, marginRight: 10}}></View>
        if (this.props.image != undefined) {
            leftDiv = <Image style={{width: 30, height: 30, marginLeft: 30, marginRight: 10}}
                             source={this.props.image}></Image>
        }

        let centerDiv = <View style={{flexGrow: 1}}></View>
        if (this.props.title != undefined && this.props.title != null) {
            centerDiv = <Text style={{
                fontSize: FONT_SIZE_TAIL_TITLE,
                fontFamily: this.props.fontFamily,
                color: this.props.fontColor,
                textAlign: this.props.titleAlign,
                flexGrow: 1,
            }}>{this.props.title}</Text>
        }

        let rightDiv = <View style={{width: 8, height: 12, marginLeft: 46, marginRight: 16}}></View>
        if (this.props.icon != undefined) {
            rightDiv = <Image style={{width: 8, height: 12, marginLeft: 46, marginRight: 16}}
                              source={this.props.icon}></Image>
        }
        return (
            <View style={[this.props.style, {
                height: HEIGHT_TAIL,
                backgroundColor: '#ffffff'
            }]}>
                <View style={{
                    marginLeft: MARGIN_ITEM_SEPARATOR_LEFT,
                    height: HEIGHT_SEPARATOR,
                    backgroundColor: topSeparatorColor
                }}></View>
                <TouchableOpacity
                    style={{flexDirection: 'row', flexGrow: 1, alignItems: 'center'}}
                    onPress={this._onSelected}>
                    {leftDiv}
                    {centerDiv}
                    {rightDiv}
                </TouchableOpacity>
                <View style={{height: HEIGHT_SEPARATOR}}></View>
            </View>
        )
    }

    //select action methods
    _onSelected() {
        if (this.props.onSelected != undefined) {
            this.props.onSelected()
        }
    }
}