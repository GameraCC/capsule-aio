import React, { useRef } from 'react'
import Select, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import colors from './colors.module.scss'

import dropdownIndicator from '../img/dropdown.svg'

export default props => {
  const selectRef = useRef()

  const { isLoading, value, onChange, disabled, required, className, autoComplete, styles, menuPlacement, creatable } = props

  return (
    <>
      {creatable ? (
        <CreatableSelect
          {...props}
          className={className ? className + ' inputSelect' : 'inputSelect'}
          components={{ DropdownIndicator }}
          styles={{ ...dropdownStyles, ...styles }}
          loadingMessage={() => 'Loading'}
          menuPlacement={menuPlacement || undefined}
          ref={selectRef}
          isDisable={isLoading}
        />
      ) : (
        <Select
          {...props}
          className={className ? className + ' inputSelect' : 'inputSelect'}
          components={{ DropdownIndicator }}
          styles={{ ...dropdownStyles, ...styles }}
          noOptionsMessage={() => 'Not Found'}
          loadingMessage={() => 'Loading'}
          menuPlacement={menuPlacement || undefined}
          ref={selectRef}
          isDisable={isLoading}
        />
      )}

      {!disabled && (
        <input
          tabIndex={-1}
          autoComplete={autoComplete}
          style={{
            opacity: 0,
            height: 0,
            padding: 0,
            borderWidth: '1px',
            bottom: '-1px',
            position: 'absolute',
          }}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => selectRef.current.focus()}
        />
      )}
    </>
  )
}

const DropdownIndicator = props =>
  components.DropdownIndicator && (
    <components.DropdownIndicator {...props}>
      <img src={dropdownIndicator} alt="" />
    </components.DropdownIndicator>
  )

const dropdownStyles = {
  container: (styles, { selectProps }) => ({
    ...styles,
    fontFamily: selectProps.analyticsHeader ? "'Semibold', sans-serif" : undefined,
  }),
  control: (styles, { selectProps, isDisabled }) => ({
    border: 'none',
    display: 'flex',
    boxSizing: 'border-box',
    width: '100%',
    fontSize: selectProps.selectHeader ? '16px' : undefined,
    backgroundColor: selectProps.selectHeader ? colors.base01 : selectProps.analyticsHeader ? colors.base1 : isDisabled ? colors.base2 : colors.base0,
    borderRadius: selectProps.selectHeader || selectProps.analyticsHeader ? '4px' : '5px',
    padding: selectProps.selectHeader ? '3px 16px' : selectProps.analyticsHeader ? '0 6px' : '2px 8px',
  }),
  input: styles => ({
    marginTop: '2px',
  }),
  valueContainer: styles => ({
    ...styles,
    maxHeight: '78px',
  }),
  singleValue: (styles, { selectProps, isDisabled }) => ({
    fontSize: selectProps.selectHeader ? '13px' : selectProps.analyticsHeader ? '14px' : undefined,
    color: selectProps.selectHeader ? colors.white50 : selectProps.analyticsHeader ? colors.white : undefined,
    lineHeight: '2px',
    marginTop: '2px',
    opacity: isDisabled ? 0.5 : 1,
  }),
  placeholder: () => ({
    width: 0,
    whiteSpace: 'nowrap',
    lineHeight: '2px',
    marginTop: '2px',
    color: 'rgba(255,255,255,0.15)',
  }),
  indicatorsContainer: styles => ({
    ...styles,
    svg: {
      height: '14px',
      width: '14px',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (styles, { selectProps }) => ({
    ...styles,
    borderRadius: '6px',
    margin: '4px 0',
    padding: '6px 0',
    boxShadow: 'none',
    backgroundColor: selectProps.selectHeader ? colors.base01 : colors.base02,
  }),
  multiValue: styles => ({
    ...styles,
    background: colors.base00,
    ':not(:first-of-type)': {
      marginLeft: '4px',
    },
  }),
  multiValueLabel: styles => ({
    ...styles,
    color: colors.white,
  }),
  multiValueRemove: styles => ({
    ...styles,
    marginLeft: '2px',
    ':hover': {
      backgroundColor: colors.base3,
    },
  }),
  loadingMessage: styles => ({
    ...styles,
    fontSize: '13px',
    padding: '6px 12px',
  }),
  noOptionsMessage: styles => ({
    ...styles,
    fontSize: '13px',
    padding: '6px 12px',
  }),
  option: (styles, { selectProps, isSelected, isFocused, isDisabled }) => ({
    ...styles,
    fontSize: selectProps.selectHeader ? '13px' : selectProps.analyticsHeader ? '14px' : '16px',
    padding: selectProps.selectHeader ? '12px 16px' : selectProps.analyticsHeader ? '2px 16px' : '6px 12px',
    backgroundColor: !isDisabled && isSelected ? colors.base0 : isFocused ? colors.violet : undefined,
    ':active': {
      ...styles[':active'],
      backgroundColor: !isDisabled && (!isSelected ? colors.blurple : undefined),
    },
  }),
}
