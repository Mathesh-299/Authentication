const getAge = async (DOB) => {
    const today = new Date();
    const birth = new Date(DOB);

    let ageValue = today.getFullYear() - birth.getFullYear();
    let month = today.getMonth() - birth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
        ageValue--;
    }
    return ageValue;
}

module.exports = getAge;
