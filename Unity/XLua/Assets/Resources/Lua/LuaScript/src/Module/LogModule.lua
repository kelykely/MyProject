---
--- Generated by EmmyLua(https://github.com/EmmyLua)
--- Created by liaojh.
--- DateTime: 2019/3/14 11:11
---
module = {};

local SHOW_LOG = true;

local function showString(string)
    print(string);
end

local function showNumber(number)
    print(number);
end

local function showNil()
    print("nil");
end

local function showTable(table)
    for k, v in pairs(table) do
        module.showLog("key: " .. k);
        module.showLog(v);
    end
end

module.showLog = function (data)
    if not SHOW_LOG then
        return;
    end
    local type = type(data);
    if type == "string" then
        showString(data);
    elseif type == "number" then
        showNumber(data);
    elseif type == "nil" then
        showNil();
    elseif type == "table" then
        showTable(data);
    end
end

return module;