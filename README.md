# BAActionSheet

An action sheet made by pure JS code for ReactNative project.

![img](https://github.com/BenArvin/BAActionSheet/blob/master/preview.gif)

## How to use

- 1. add .js file into your project
- 2. import and add BAActionSheet into render method where you want use it
```
//example
render() {
  return (
    <View>
      <Text>example</Text>
      <BAActionSheet ref={'actionSheet'} />
    </View>
  )
}
```
- 3. use ref get instance of action sheet, and call method like .setGlobalStyle(), .setHeaderStyle(), .setBodyStyle(), .setTailStyle() in appropriate time, to modify styles of action sheet like font color, text align, etc...
```
//example
this.refs.actionSheet.setHeaderStyle('#353543', 'PingFangSC-Light', true)
```
- 5. use ref get instance of action sheet, and call .show() method, then action sheet will pop in and work
```
//example
this.refs.actionSheet.show(dataForActionSheet, onFinishedFunc)
```
- 6. also you can call .hide() method to pop out and hide action sheet, if you want hide it by code
```
//example
this.refs.actionSheet.hide(onFinishedFunc)
```

## Attention
Due to bottom system bar in android device, this action sheet might not perfect in android. But, you can fix this problem easily by modify source code directly, and you will find more detail at FIXME flag.

## Self define
You can modify code directly if UI style not suit for you now.
