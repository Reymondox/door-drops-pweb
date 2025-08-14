export function SearchInList(list, name, categorieIds, authorIds){
    let newList = list;
    if(name !== "" && name !== undefined){
        newList = newList.filter((element) =>  element.name.toLowerCase().includes(name.toLowerCase()) );   

    }    if (categorieIds !== "" && categorieIds !== undefined) {
        if (Array.isArray(categorieIds)) {
            const parsedCategorieIds = categorieIds.map(id => Number(id)).filter(id => !isNaN(id));
            if (parsedCategorieIds.length > 0) {
                newList = newList.filter((element) =>
                    parsedCategorieIds.includes(Number(element.categorieId))
                )}
        } else {
            const parsedCategorieId = Number(categorieIds);
            if (!isNaN(parsedCategorieId)) {
                newList = newList.filter((element) =>
                    Number(element.categorieId) === parsedCategorieId
                )};
        }
    }

    if (authorIds !== "" && authorIds !== undefined) {
        if (Array.isArray(authorIds)) {
            const parsedAuthorIds = authorIds.map(id => Number(id)).filter(id => !isNaN(id));
            if (parsedAuthorIds.length > 0) {
                newList = newList.filter((element) =>
                    parsedAuthorIds.includes(Number(element.authorId))
                );
            }
        } else {
            const parsedAuthorId = Number(authorIds);
            if (!isNaN(parsedAuthorId)) {
                newList = newList.filter((element) =>
                    Number(element.authorId) === parsedAuthorId
                )};
        }
    }
    return newList
}