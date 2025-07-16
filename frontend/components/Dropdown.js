import React, { useState } from 'react';
import styles from './Dropdown.module.css';

const Dropdown = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.dropdown} onMouseOver={()=>setIsOpen(true)} onMouseLeave={()=>setIsOpen(false)}>
            <a style={{cursor: 'pointer'}}>
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
