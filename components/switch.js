import React from 'react'
import classNames from '../styles/toggleSwitch.module.css'
export default React.forwardRef(function ToggleSwitch(props,ref){
    return <label className={classNames.switch}>
    <input ref={ref} type='checkbox' {...props}/>
    <span className={classNames.switch}></span>
    </label>
})