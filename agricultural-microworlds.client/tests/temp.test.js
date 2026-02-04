function testTest(stuff){
    return stuff;
}

test('tmp test', () =>{
    const stuff = "thing";
    expect(testTest("thing")).toBe(stuff);
})