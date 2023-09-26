let numbers = [5, 8, 12, 19, 22];

function sumTwoSmallestNumbers(numbers) {

    let sortedArray = numbers.sort((a, b) => a - b)
    let sort1 = sortedArray.slice(0, 2)
    function sumArray(sort1) {
        let sum = 0;
        for (let i = 0; i < sort1.length; i++) {
            sum += sort1[i];
        }
        return sum;
    }
    return sumArray(sort1);
}

sumTwoSmallestNumbers(numbers)