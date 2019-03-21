#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 20 20:46:36 2019

@author: youjia
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from mpl_toolkits.mplot3d import Axes3D


path = "/Users/youjia/Documents/Utah-Soc/research/MSVF/VIS-MSVF/app/static/assets/"

grad = pd.read_csv(path+"grad.csv")
grad = grad.iloc[:,1:]
grad = grad.iloc[:,[0,1,6]]
temp = grad.iloc[0:200,:]
temp = temp.iloc[:,[0,1,6]]
sp1 = grad.iloc[[0,1,100,101],[0,1,6]]
with open(path+"try.txt","w") as f:
    f.write("2\n")
    f.write("3\n")
    f.write(str(sp1.iloc[0,0])+" "+str(sp1.iloc[0,1])+" "+str(sp1.iloc[0,2])+ " "+str(sp1.iloc[1,0])+" "+str(sp1.iloc[1,1])+" "+str(sp1.iloc[1,2])+ " "+str(sp1.iloc[2,0])+" "+str(sp1.iloc[2,1])+" "+str(sp1.iloc[2,2])+" 1\n")
    f.write(str(sp1.iloc[1,0])+" "+str(sp1.iloc[1,1])+" "+str(sp1.iloc[1,2])+ " "+str(sp1.iloc[2,0])+" "+str(sp1.iloc[2,1])+" "+str(sp1.iloc[2,2])+ " "+str(sp1.iloc[3,0])+" "+str(sp1.iloc[3,1])+" "+str(sp1.iloc[3,2])+" 1\n")
f.close()

temp = np.array(grad.iloc[:,2])
np.max(temp)
temp1 = np.max(temp)-temp
temp2 = temp1-np.min(temp1)
np.min(temp2)
def constructSp(df):
    df = np.array(df)
    sp = []
    temp = df[:,2]
    temp1 = np.max(temp)-temp
    temp2 = temp1-np.min(temp1)
    
    for i in range(0,99):
        for j in range(0,99):
            print(i,j)
            idx = 100*j+i
            pt1 = df[idx,:]
            pt2 = df[idx+1,:]
            pt3 = df[idx+100,:]
            pt4 = df[idx+101,:]
            line1 = str(int(round(pt1[0]*100)))+" "+str(int(round(pt1[1]*100)))+" "+str(int(round(pt2[0]*100)))+" "+str(int(round(pt2[1]*100)))+" "+str(int(round(pt3[0]*100)))+" "+str(int(round(pt3[1]*100)))+" "+str(int(round((1-pt1[2])*100)))+"\n"
            line2 = str(int(round(pt2[0]*100)))+" "+str(int(round(pt2[1]*100)))+" "+str(int(round(pt3[0]*100)))+" "+str(int(round(pt3[1]*100)))+" "+str(int(round(pt4[0]*100)))+" "+str(int(round(pt4[1]*100)))+" "+str(int(round((1-pt4[2])*100)))+"\n"
#            line1 = str(round(pt1[0]*100))+" "+str(round(pt1[1]*100))+" "+str(round(pt2[0]*100))+" "+str(round(pt2[1]*100))+" "+str(round(pt3[0]*100))+" "+str(round(pt3[1]*100))+" "+str(idx)+"\n"
#            line2 = str(round(pt2[0]*100))+" "+str(round(pt2[1]*100))+" "+str(round(pt3[0]*100))+" "+str(round(pt3[1]*100))+" "+str(round(pt4[0]*100))+" "+str(round(pt4[1]*100))+" "+str(idx)+"\n"
 
            sp.append(line1)
            sp.append(line2)
    return sp

SP = constructSp(grad)
with open(path+"try2.txt","w") as f:
    f.write("2\n")
    f.write("2\n")
    for line in SP:
        f.write(line)
f.close()

spp = pd.read_csv(path+"try2.txt",sep=" ",header=None,skiprows=2)
spp = spp.sort_values(by=[6])
with open(path+"try2.txt","w") as f:
    f.write("2\n")
    f.write("2\n")
    for i in range(0,len(spp)):
        line = list(spp.iloc[i,:])
        s = ""
        for e in line:
            s+= str(e)+" "
        s += "\n"
        f.write(s)
f.close()
#spp.to_csv(path+"try.txt",sep=" ")

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.scatter(grad.iloc[:,0], grad.iloc[:,1], grad.iloc[:,2], c='b', marker='o',s=0.5)

plt.scatter(grad.iloc[:,0],grad.iloc[:,2],s=0.5)
