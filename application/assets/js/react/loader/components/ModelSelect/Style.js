export default {
    control: (base, state) => {
        return { ...base,
            backgroundColor: '#fff',
            borderColor: state.isFocused ? '#3c8dbc' : '#ccc',
            boxShadow: 'none',
            borderRadius: '0',
            minHeight: '34px',
            '&:hover': {
                borderColor: state.isFocused ? '#3c8dbc' : '#ccc',
                boxShadow: 'none'
            }
        }
    },
    option: (base, state) => {
        return { ...base,
            cursor: 'pointer',
            backgroundColor: state.isSelected ? '#428bca' : 'transparent',
            '&:active': {
                backgroundColor: state.isSelected ? '#428bca' : 'transparent'
            },
            '&:hover': {
                backgroundColor: state.isSelected ? '#428bca' : '#f5f5f5',
            }
        }
    },
    menu: (base, state) => {
        return { ...base,
            zIndex: '1000'
        }
    },
    dropdownIndicator: (base, state) => {
        return { ...base,
            padding: '6px'
        }
    },
    clearIndicator: (base, state) => {
        return { ...base,
            padding: '6px'
        }
    }
};