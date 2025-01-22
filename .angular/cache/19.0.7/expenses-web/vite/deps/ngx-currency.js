import {
  NG_VALUE_ACCESSOR
} from "./chunk-NA34HJAZ.js";
import "./chunk-PWCOIAQ7.js";
import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  InjectionToken,
  Input,
  KeyValueDiffers,
  Optional,
  __spreadValues,
  forwardRef,
  makeEnvironmentProviders,
  setClassMetadata,
  ɵɵProvidersFeature,
  ɵɵdefineDirective,
  ɵɵdirectiveInject,
  ɵɵlistener
} from "./chunk-YWVPXKW7.js";

// node_modules/ngx-currency/fesm2022/ngx-currency.mjs
var NgxCurrencyInputMode;
(function(NgxCurrencyInputMode2) {
  NgxCurrencyInputMode2[NgxCurrencyInputMode2["Financial"] = 0] = "Financial";
  NgxCurrencyInputMode2[NgxCurrencyInputMode2["Natural"] = 1] = "Natural";
})(NgxCurrencyInputMode || (NgxCurrencyInputMode = {}));
var NGX_CURRENCY_CONFIG = new InjectionToken("ngx-currency.config");
var InputManager = class {
  constructor(_htmlInputElement) {
    this._htmlInputElement = _htmlInputElement;
    this._storedRawValue = null;
  }
  setCursorAt(position) {
    this._htmlInputElement.focus();
    this._htmlInputElement.setSelectionRange(position, position);
  }
  updateValueAndCursor(newRawValue, oldLength, selectionStart) {
    this.rawValue = newRawValue;
    const newLength = newRawValue.length;
    selectionStart = selectionStart - (oldLength - newLength);
    this.setCursorAt(selectionStart);
  }
  get canInputMoreNumbers() {
    const onlyNumbers = this.rawValue?.replace(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g, "") ?? "";
    const hasReachedMaxLength = !(onlyNumbers.length >= this._htmlInputElement.maxLength && this._htmlInputElement.maxLength >= 0);
    const selectionStart = this.inputSelection.selectionStart;
    const selectionEnd = this.inputSelection.selectionEnd;
    const haveNumberSelected = !!(selectionStart != selectionEnd && this._htmlInputElement.value.substring(selectionStart, selectionEnd).match(/[^0-9\u0660-\u0669\u06F0-\u06F9]/));
    const startWithZero = this._htmlInputElement.value.substring(0, 1) == "0";
    return hasReachedMaxLength || haveNumberSelected || startWithZero;
  }
  get inputSelection() {
    return {
      selectionStart: this._htmlInputElement.selectionStart ?? 0,
      selectionEnd: this._htmlInputElement.selectionEnd ?? 0
    };
  }
  get rawValue() {
    return this._htmlInputElement && this._htmlInputElement.value;
  }
  set rawValue(value) {
    this._storedRawValue = value;
    if (this._htmlInputElement) {
      this._htmlInputElement.value = value ?? "";
    }
  }
  get storedRawValue() {
    return this._storedRawValue || "";
  }
};
var InputService = class {
  constructor(htmlInputElement, _options) {
    this._options = _options;
    this._singleDigitRegex = new RegExp(/^[0-9\u0660-\u0669\u06F0-\u06F9]$/);
    this._onlyNumbersRegex = new RegExp(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g);
    this._perArNumber = /* @__PURE__ */ new Map([["۰", "0"], ["۱", "1"], ["۲", "2"], ["۳", "3"], ["۴", "4"], ["۵", "5"], ["۶", "6"], ["۷", "7"], ["۸", "8"], ["۹", "9"], ["٠", "0"], ["١", "1"], ["٢", "2"], ["٣", "3"], ["٤", "4"], ["٥", "5"], ["٦", "6"], ["٧", "7"], ["٨", "8"], ["٩", "9"]]);
    this.inputManager = new InputManager(htmlInputElement);
  }
  addNumber(keyCode) {
    const {
      decimal,
      precision,
      inputMode
    } = this._options;
    const keyChar = String.fromCharCode(keyCode);
    const isDecimalChar = keyChar === this._options.decimal;
    if (!this.rawValue) {
      this.rawValue = this.applyMask(false, keyChar);
      let selectionStart = void 0;
      if (inputMode === NgxCurrencyInputMode.Natural && precision > 0) {
        selectionStart = this.rawValue.indexOf(decimal);
        if (isDecimalChar) {
          selectionStart++;
        }
      }
      this.updateFieldValue(selectionStart);
    } else {
      const selectionStart = this.inputSelection.selectionStart;
      const selectionEnd = this.inputSelection.selectionEnd;
      const rawValueStart = this.rawValue.substring(0, selectionStart);
      let rawValueEnd = this.rawValue.substring(selectionEnd, this.rawValue.length);
      const inDecimalPortion = rawValueStart.indexOf(decimal) !== -1;
      if (inputMode === NgxCurrencyInputMode.Natural && inDecimalPortion && selectionStart === selectionEnd) {
        rawValueEnd = rawValueEnd.substring(1);
      }
      const newValue = rawValueStart + keyChar + rawValueEnd;
      let nextSelectionStart = selectionStart + 1;
      const isDecimalOrThousands = isDecimalChar || keyChar === this._options.thousands;
      if (isDecimalOrThousands && keyChar === rawValueEnd[0]) {
        nextSelectionStart++;
      } else if (!this._singleDigitRegex.test(keyChar)) {
        return;
      }
      this.rawValue = newValue;
      this.updateFieldValue(nextSelectionStart);
    }
  }
  applyMask(isNumber, rawValue, disablePadAndTrim = false) {
    const {
      allowNegative,
      decimal,
      precision,
      prefix,
      suffix,
      thousands,
      min,
      inputMode
    } = this._options;
    let {
      max
    } = this._options;
    rawValue = isNumber ? new Number(rawValue).toFixed(precision) : rawValue;
    let onlyNumbers = rawValue.replace(this._onlyNumbersRegex, "");
    if (!onlyNumbers && rawValue !== decimal) {
      return "";
    }
    if (inputMode === NgxCurrencyInputMode.Natural && !isNumber && !disablePadAndTrim) {
      rawValue = this.padOrTrimPrecision(rawValue);
      onlyNumbers = rawValue.replace(this._onlyNumbersRegex, "");
    }
    let integerPart = onlyNumbers.slice(0, onlyNumbers.length - precision).replace(/^\u0660*/g, "").replace(/^\u06F0*/g, "").replace(/^0*/g, "");
    if (integerPart == "") {
      integerPart = "0";
    }
    const integerValue = parseInt(integerPart);
    integerPart = integerPart.replace(/\B(?=([0-9\u0660-\u0669\u06F0-\u06F9]{3})+(?![0-9\u0660-\u0669\u06F0-\u06F9]))/g, thousands);
    if (thousands && integerPart.startsWith(thousands)) {
      integerPart = integerPart.substring(1);
    }
    let newRawValue = integerPart;
    const decimalPart = onlyNumbers.slice(onlyNumbers.length - precision);
    const decimalValue = parseInt(decimalPart) || 0;
    const isNegative = rawValue.indexOf("-") > -1;
    max = max === null || max === void 0 || min === null || min === void 0 ? max : Math.max(max, min);
    const divideBy = Number("1".padEnd(precision + 1, "0"));
    let newValue = integerValue + decimalValue / divideBy;
    newValue = isNegative ? -newValue : newValue;
    if (max !== null && max !== void 0 && newValue > max) {
      return this.applyMask(true, max + "");
    } else if (min !== null && min !== void 0 && newValue < min) {
      return this.applyMask(true, min + "");
    }
    if (precision > 0) {
      if (newRawValue == "0" && decimalPart.length < precision) {
        newRawValue += decimal + "0".repeat(precision - 1) + decimalPart;
      } else {
        newRawValue += decimal + decimalPart;
      }
    }
    const operator = isNegative && allowNegative ? "-" : "";
    return operator + prefix + newRawValue + suffix;
  }
  padOrTrimPrecision(rawValue) {
    const {
      decimal,
      precision
    } = this._options;
    let decimalIndex = rawValue.lastIndexOf(decimal);
    if (decimalIndex === -1) {
      decimalIndex = rawValue.length;
      rawValue += decimal;
    }
    let decimalPortion = rawValue.substring(decimalIndex).replace(this._onlyNumbersRegex, "");
    const actualPrecision = decimalPortion.length;
    if (actualPrecision < precision) {
      for (let i = actualPrecision; i < precision; i++) {
        decimalPortion += "0";
      }
    } else if (actualPrecision > precision) {
      decimalPortion = decimalPortion.substring(0, decimalPortion.length + precision - actualPrecision);
    }
    return rawValue.substring(0, decimalIndex) + decimal + decimalPortion;
  }
  clearMask(rawValue) {
    if (this.isNullable() && rawValue === "") return null;
    let value = (rawValue || "0").replace(this._options.prefix, "").replace(this._options.suffix, "");
    if (this._options.thousands) {
      value = value.replace(new RegExp("\\" + this._options.thousands, "g"), "");
    }
    if (this._options.decimal) {
      value = value.replace(this._options.decimal, ".");
    }
    this._perArNumber.forEach((val, key) => {
      const re = new RegExp(key, "g");
      value = value.replace(re, val);
    });
    return parseFloat(value);
  }
  changeToNegative() {
    if (this._options.allowNegative && this.rawValue?.charAt(0) != "-") {
      this.rawValue = this.applyMask(false, "-" + (this.rawValue ? this.rawValue : "0"));
    }
  }
  changeToPositive() {
    this.rawValue = this.applyMask(false, this.rawValue?.replace("-", "") ?? "");
  }
  removeNumber(keyCode) {
    const {
      decimal,
      thousands,
      prefix,
      suffix,
      inputMode
    } = this._options;
    if (this.isNullable() && this.value == 0) {
      this.rawValue = null;
      return;
    }
    let selectionEnd = this.inputSelection.selectionEnd;
    let selectionStart = this.inputSelection.selectionStart;
    const suffixStart = (this.rawValue?.length ?? 0) - suffix.length;
    selectionEnd = Math.min(suffixStart, Math.max(selectionEnd, prefix.length));
    selectionStart = Math.min(suffixStart, Math.max(selectionStart, prefix.length));
    if (selectionStart === selectionEnd && this.inputSelection.selectionStart !== this.inputSelection.selectionEnd) {
      this.updateFieldValue(selectionStart);
      return;
    }
    let decimalIndex = this.rawValue?.indexOf(decimal) ?? -1;
    if (decimalIndex === -1) {
      decimalIndex = this.rawValue?.length ?? 0;
    }
    let shiftSelection = 0;
    let insertChars = "";
    const isCursorInDecimals = decimalIndex < selectionEnd;
    const isCursorImmediatelyAfterDecimalPoint = decimalIndex + 1 === selectionEnd;
    if (selectionEnd === selectionStart) {
      if (keyCode == 8) {
        if (selectionStart <= prefix.length) {
          return;
        }
        selectionStart--;
        if (!this.rawValue?.substring(selectionStart, selectionStart + 1).match(/\d/)) {
          selectionStart--;
        }
        if (inputMode === NgxCurrencyInputMode.Natural && isCursorInDecimals) {
          shiftSelection = -1;
          if (isCursorImmediatelyAfterDecimalPoint && (this.value ?? 0) < 10 && (this.value ?? 0) > -10) {
            insertChars += "0";
          }
        }
      } else if (keyCode == 46 || keyCode == 63272) {
        if (selectionStart === suffixStart) {
          return;
        }
        selectionEnd++;
        if (!this.rawValue?.substring(selectionStart, selectionStart + 1).match(/\d/)) {
          selectionStart++;
          selectionEnd++;
        }
      }
    }
    if (inputMode === NgxCurrencyInputMode.Natural && selectionStart > decimalIndex) {
      const replacedDecimalCount = selectionEnd - selectionStart;
      for (let i = 0; i < replacedDecimalCount; i++) {
        insertChars += "0";
      }
    }
    let selectionFromEnd = (this.rawValue?.length ?? 0) - selectionEnd;
    this.rawValue = this.rawValue?.substring(0, selectionStart) + insertChars + this.rawValue?.substring(selectionEnd);
    const startChar = this.rawValue.substring(prefix.length, prefix.length + 1);
    if (startChar === thousands) {
      this.rawValue = this.rawValue.substring(0, prefix.length) + this.rawValue.substring(prefix.length + 1);
      selectionFromEnd = Math.min(selectionFromEnd, this.rawValue.length - prefix.length);
    }
    this.updateFieldValue(this.rawValue.length - selectionFromEnd + shiftSelection, true);
  }
  updateFieldValue(selectionStart, disablePadAndTrim = false) {
    const newRawValue = this.applyMask(false, this.rawValue ?? "", disablePadAndTrim);
    selectionStart ??= this.rawValue?.length ?? 0;
    selectionStart = Math.max(this._options.prefix.length, Math.min(selectionStart, (this.rawValue?.length ?? 0) - this._options.suffix.length));
    this.inputManager.updateValueAndCursor(newRawValue, this.rawValue?.length ?? 0, selectionStart);
  }
  updateOptions(options) {
    const value = this.value;
    this._options = options;
    this.value = value;
  }
  prefixLength() {
    return this._options.prefix.length;
  }
  suffixLength() {
    return this._options.suffix.length;
  }
  isNullable() {
    return this._options.nullable;
  }
  get canInputMoreNumbers() {
    return this.inputManager.canInputMoreNumbers;
  }
  get inputSelection() {
    return this.inputManager.inputSelection;
  }
  get rawValue() {
    return this.inputManager.rawValue;
  }
  set rawValue(value) {
    this.inputManager.rawValue = value;
  }
  get storedRawValue() {
    return this.inputManager.storedRawValue;
  }
  get value() {
    return this.clearMask(this.rawValue);
  }
  set value(value) {
    this.rawValue = this.applyMask(true, "" + value);
  }
  _isNullOrUndefined(value) {
    return value === null || value === void 0;
  }
};
var InputHandler = class {
  constructor(htmlInputElement, options) {
    this.onModelChange = () => void 0;
    this.onModelTouched = () => void 0;
    this.inputService = new InputService(htmlInputElement, options);
  }
  handleCut() {
    setTimeout(() => {
      this.inputService.updateFieldValue();
      this.setValue(this.inputService.value);
      this.onModelChange(this.inputService.value);
    }, 0);
  }
  handleInput() {
    const rawValue = this.inputService.rawValue ?? "";
    const selectionStart = this.inputService.inputSelection.selectionStart;
    const keyCode = rawValue.charCodeAt(selectionStart - 1);
    const rawValueLength = rawValue.length;
    const storedRawValueLength = this.inputService.storedRawValue.length;
    if (Math.abs(rawValueLength - storedRawValueLength) != 1) {
      this.inputService.updateFieldValue(selectionStart);
      this.onModelChange(this.inputService.value);
      return;
    }
    this.inputService.rawValue = this.inputService.storedRawValue;
    if (rawValueLength < storedRawValueLength) {
      this.timer(() => {
        this.inputService.updateFieldValue(selectionStart + 1);
        this.inputService.removeNumber(8);
        this.onModelChange(this.inputService.value);
      }, 0);
    }
    if (rawValueLength > storedRawValueLength) {
      this.inputService.updateFieldValue(selectionStart - 1);
      this._handleKeypressImpl(keyCode);
    }
  }
  handleKeydown(event) {
    const keyCode = event.which || event.charCode || event.keyCode;
    if (keyCode == 8 || keyCode == 46 || keyCode == 63272) {
      event.preventDefault();
      if (this.inputService.inputSelection.selectionStart <= this.inputService.prefixLength() && this.inputService.inputSelection.selectionEnd >= (this.inputService.rawValue?.length ?? 0) - this.inputService.suffixLength()) {
        this.clearValue();
      } else {
        this.inputService.removeNumber(keyCode);
        this.onModelChange(this.inputService.value);
      }
    }
  }
  clearValue() {
    this.setValue(this.inputService.isNullable() ? null : 0);
    this.onModelChange(this.inputService.value);
  }
  handleKeypress(event) {
    const keyCode = event.which || event.charCode || event.keyCode;
    event.preventDefault();
    if (keyCode === 97 && event.ctrlKey) {
      return;
    }
    this._handleKeypressImpl(keyCode);
  }
  _handleKeypressImpl(keyCode) {
    switch (keyCode) {
      case void 0:
      case 9:
      case 13:
        return;
      case 43:
        this.inputService.changeToPositive();
        break;
      case 45:
        this.inputService.changeToNegative();
        break;
      default:
        if (this.inputService.canInputMoreNumbers) {
          const selectionRangeLength = Math.abs(this.inputService.inputSelection.selectionEnd - this.inputService.inputSelection.selectionStart);
          if (selectionRangeLength == (this.inputService.rawValue?.length ?? 0)) {
            this.setValue(null);
          }
          this.inputService.addNumber(keyCode);
        }
        break;
    }
    this.onModelChange(this.inputService.value);
  }
  handlePaste() {
    setTimeout(() => {
      this.inputService.updateFieldValue();
      this.setValue(this.inputService.value);
      this.onModelChange(this.inputService.value);
    }, 1);
  }
  updateOptions(options) {
    this.inputService.updateOptions(options);
  }
  getOnModelChange() {
    return this.onModelChange;
  }
  setOnModelChange(callbackFunction) {
    this.onModelChange = callbackFunction;
  }
  getOnModelTouched() {
    return this.onModelTouched;
  }
  setOnModelTouched(callbackFunction) {
    this.onModelTouched = callbackFunction;
  }
  setValue(value) {
    this.inputService.value = value;
  }
  /**
   * Passthrough to setTimeout that can be stubbed out in tests.
   */
  timer(callback, delayMilliseconds) {
    setTimeout(callback, delayMilliseconds);
  }
};
var NgxCurrencyDirective = class _NgxCurrencyDirective {
  set currencyMask(value) {
    if (typeof value === "string") return;
    this._options = value;
  }
  /**
   * @deprecated Use currencyMask input instead
   */
  set options(value) {
    this._options = value;
  }
  constructor(globalOptions, keyValueDiffers, _elementRef) {
    this._elementRef = _elementRef;
    this._options = {};
    this._optionsTemplate = __spreadValues({
      align: "right",
      allowNegative: true,
      allowZero: true,
      decimal: ".",
      precision: 2,
      prefix: "$ ",
      suffix: "",
      thousands: ",",
      nullable: false,
      inputMode: NgxCurrencyInputMode.Financial
    }, globalOptions);
    this._keyValueDiffer = keyValueDiffers.find({}).create();
    this._inputHandler = new InputHandler(this._elementRef.nativeElement, __spreadValues(__spreadValues({}, this._optionsTemplate), this._options));
  }
  ngAfterViewInit() {
    this._elementRef.nativeElement.style.textAlign = this._options?.align ?? this._optionsTemplate.align;
  }
  ngDoCheck() {
    if (this._keyValueDiffer.diff(this._options)) {
      this._elementRef.nativeElement.style.textAlign = this._options?.align ?? this._optionsTemplate.align;
      this._inputHandler.updateOptions(__spreadValues(__spreadValues({}, this._optionsTemplate), this._options));
    }
  }
  handleBlur(event) {
    this._inputHandler.getOnModelTouched().apply(event);
  }
  handleCut() {
    if (!this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handleCut();
    }
  }
  handleInput() {
    if (this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handleInput();
    }
  }
  handleKeydown(event) {
    if (!this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handleKeydown(event);
    }
  }
  handleKeypress(event) {
    if (!this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handleKeypress(event);
    }
  }
  handlePaste() {
    if (!this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handlePaste();
    }
  }
  handleDrop(event) {
    if (!this.isChromeAndroid()) {
      event.preventDefault();
    }
  }
  isChromeAndroid() {
    return /chrome/i.test(navigator.userAgent) && /android/i.test(navigator.userAgent);
  }
  isReadOnly() {
    return this._elementRef.nativeElement.hasAttribute("readonly");
  }
  registerOnChange(callbackFunction) {
    this._inputHandler.setOnModelChange(callbackFunction);
  }
  registerOnTouched(callbackFunction) {
    this._inputHandler.setOnModelTouched(callbackFunction);
  }
  setDisabledState(isDisabled) {
    this._elementRef.nativeElement.disabled = isDisabled;
  }
  writeValue(value) {
    this._inputHandler.setValue(value);
  }
  static {
    this.ɵfac = function NgxCurrencyDirective_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NgxCurrencyDirective)(ɵɵdirectiveInject(NGX_CURRENCY_CONFIG, 8), ɵɵdirectiveInject(KeyValueDiffers), ɵɵdirectiveInject(ElementRef));
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _NgxCurrencyDirective,
      selectors: [["input", "currencyMask", ""]],
      hostBindings: function NgxCurrencyDirective_HostBindings(rf, ctx) {
        if (rf & 1) {
          ɵɵlistener("blur", function NgxCurrencyDirective_blur_HostBindingHandler($event) {
            return ctx.handleBlur($event);
          })("cut", function NgxCurrencyDirective_cut_HostBindingHandler() {
            return ctx.handleCut();
          })("input", function NgxCurrencyDirective_input_HostBindingHandler() {
            return ctx.handleInput();
          })("keydown", function NgxCurrencyDirective_keydown_HostBindingHandler($event) {
            return ctx.handleKeydown($event);
          })("keypress", function NgxCurrencyDirective_keypress_HostBindingHandler($event) {
            return ctx.handleKeypress($event);
          })("paste", function NgxCurrencyDirective_paste_HostBindingHandler() {
            return ctx.handlePaste();
          })("drop", function NgxCurrencyDirective_drop_HostBindingHandler($event) {
            return ctx.handleDrop($event);
          });
        }
      },
      inputs: {
        currencyMask: "currencyMask",
        options: "options"
      },
      features: [ɵɵProvidersFeature([{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => _NgxCurrencyDirective),
        multi: true
      }])]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxCurrencyDirective, [{
    type: Directive,
    args: [{
      selector: "input[currencyMask]",
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => NgxCurrencyDirective),
        multi: true
      }]
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [NGX_CURRENCY_CONFIG]
    }]
  }, {
    type: KeyValueDiffers
  }, {
    type: ElementRef
  }], {
    currencyMask: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    handleBlur: [{
      type: HostListener,
      args: ["blur", ["$event"]]
    }],
    handleCut: [{
      type: HostListener,
      args: ["cut"]
    }],
    handleInput: [{
      type: HostListener,
      args: ["input"]
    }],
    handleKeydown: [{
      type: HostListener,
      args: ["keydown", ["$event"]]
    }],
    handleKeypress: [{
      type: HostListener,
      args: ["keypress", ["$event"]]
    }],
    handlePaste: [{
      type: HostListener,
      args: ["paste"]
    }],
    handleDrop: [{
      type: HostListener,
      args: ["drop", ["$event"]]
    }]
  });
})();
function provideEnvironmentNgxCurrency(config) {
  return makeEnvironmentProviders([{
    provide: NGX_CURRENCY_CONFIG,
    useValue: config
  }]);
}
export {
  NGX_CURRENCY_CONFIG,
  NgxCurrencyDirective,
  NgxCurrencyInputMode,
  provideEnvironmentNgxCurrency
};
//# sourceMappingURL=ngx-currency.js.map
