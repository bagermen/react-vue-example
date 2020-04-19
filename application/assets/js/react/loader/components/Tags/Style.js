import styles from '../ModelSelect/Style.js';

export default Object.assign({
    multiValueRemove: (base, state) => {
        return { ...base,
            '&:hover': {
                backgroundColor: 'transparent',
                color: '#ffffff',
            }
        }
    },
    multiValueLabel: (base, state) => {
        return { ...base,
            paddingRight: state.isDisabled ? '7px' : '3px'
        }
    }
}, styles);