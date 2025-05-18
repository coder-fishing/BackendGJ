import classNames from "classnames/bind";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import Button from "~/components/Button";
import styles from "./Search.module.scss";
import { MdOutlineClear } from "react-icons/md";

const cx = classNames.bind(styles);

function Search(...props) {
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.value;
        if (!value.startsWith(' ')) {
            setSearchValue(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!searchValue.trim()) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (!token) {
                console.log('No token found');
                navigate('/user/login', { 
                    state: { 
                        from: '/user/jobs', 
                        message: 'Please login to search jobs.' 
                    } 
                });
                return;
            }

            // Navigate to jobs page with search query
            navigate(`/user/jobs?search=${encodeURIComponent(searchValue)}`);
        } catch (error) {
            console.error('Error searching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchValue('');
        inputRef.current.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (     
        <div className={cx("container")} {...props}>
            <div className={cx("inputWrapper")}>
                <input
                    ref={inputRef}
                    className={cx("findAndApplySearchInput")}
                    type="text"
                    placeholder="Search for Jobs"
                    value={searchValue}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                />
                {searchValue && (
                    <MdOutlineClear 
                        className={cx("clearButton")}
                        onClick={handleClear}
                    />                  
                )}
            </div>
            <Button
                className={cx("findAndApplySearchButton")}
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? 'Searching...' : 'Search'}
            </Button>
        </div>
    );
}

export default Search;
