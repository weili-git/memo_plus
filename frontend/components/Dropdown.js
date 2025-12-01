import React, { useState, useCallback, useRef } from 'react';
import styles from './Dropdown.module.css';

const Dropdown = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const timerRef = useRef(null);

    // 鼠标移入：立刻打开，下次触发前清除关闭定时器
    const handleMouseEnter = () => {
        clearTimeout(timerRef.current);
        setIsOpen(true);
    };

    // 鼠标移出：延时关闭，避免移动到子菜单时瞬间关闭
    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 50); // 延时 200ms 可自行调整
    };

    // 切换函数（用 useCallback 避免重复创建）
    const openMenu = useCallback(() => setIsOpen(true), []);
    const closeMenu = useCallback(() => setIsOpen(false), []);

    return (
        <div className={styles.dropdown} onMouseOver={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <a style={{ cursor: 'pointer' }}>
                {props.title}
            </a>
            {isOpen && (
                <div className={styles.dropdownContent}>
                    {props.children}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
