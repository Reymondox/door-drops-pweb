export function GetCommerce(req, res, next){
        res.render("commerce/home",
            {"page-title": "Door Drops - Commerce", layout: "commerce-layout" }
        )
}
